import { $, component$, noSerialize, type NoSerialize, useContext, useStore, useVisibleTask$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";

import "./style.css"
import { connectionCtx, permissionsCtx } from "~/routes/layout";
import { cache } from "~/lib/local";
import Tableau, { Ligne } from "~/components/membres/Tableau";
import { LuLoader2 } from "@qwikest/icons/lucide";

import Filtres from "~/components/membres/Filtres";
import { type SerializableMembre, MembreUninstanciator, until } from "~/components/membres/utils";
import { selectPoles, selectPromotions, SelectQuery } from "~/components/membres/Queries";
import sort from "~/components/membres/Sort";
import Edition from "~/components/membres/Edition";
import { RecordId } from "surrealdb";

interface Data {
    promotions: string[],
    poles: string[],
    loading: boolean,
    trie: [string, 'asc' | 'desc'],
    builder?: NoSerialize<SelectQuery>, // Constructeur de requête SUQL
    edition?: SerializableMembre // Popup pour modifier un membre
}

export default component$(() => {
    const conn = useContext(connectionCtx)
    const permissions = useContext(permissionsCtx)
    const data = useStore<Data>({
        trie: ['nom', 'asc'],
        poles: [],
        promotions: [],
        loading: false,
    })
    const membres = useStore<SerializableMembre[]>([]);

    useVisibleTask$(async () => {
        // Un constructeur de query pour simplifier les filtres.
        data.builder = noSerialize(new SelectQuery(
            "id, email, heures, nom, prenom, array::map(poles, |$v| $v.nom) AS poles, promotion", 'membres'))
        data.loading = true;
        // On attends que la connexion avec base de données soit établit.
        await until(() => !!conn.value);

        // On récupère les filtres disponibles
        data.poles = await cache('list-poles', 60 * 60 * 24, async () => {
            return await selectPoles(conn.value!)
        });

        data.promotions = await cache('list-promotion', 60 * 60 * 24, async () => {
            return await selectPromotions(conn.value!)
        })

        // On récupère les membres via le cache en premier lieu
        const cached_membres = await cache('list-membre', 60 * 5, async () => {
            const query = data.builder!.query();
            const response = await conn.value!.query<[Omit<Membre, 'pass'>[]]>(...query);
            return response[0].map(m => MembreUninstanciator(m));
        })

        membres.push(...cached_membres)


        data.loading = false;
    })

    // Recherche textuelle parmis les membres 
    const recherche = $(async (search: string) => {
        if(!data.builder || !conn.value) {
            return;
        }
        data.loading = true;
        
        // On applique le filtre 'search' aux filtres déjà existants
        data.builder!.applique({ search });
        
        // On construit la requête SUQL
        const query = data.builder.query();
        
        // On fait la requête
        const response = await conn.value.query<[Omit<Membre, 'pass'>[]]>(...query);
        
        const m = response[0].map(m => MembreUninstanciator(m))
        // On supprime les anciens membres, on ajoute les nouveaux.
        membres.splice(0, membres.length);
        membres.push(...m);
        data.loading = false;
    });

    const filtres = $(async (poles: string[], promotions: string[]) => {
        if(!data.builder || !conn.value) {
            return;
        }
        data.loading = true;
        
        data.builder!.applique({ poles, promotions });
        const query = data.builder.query();
        const response = await conn.value.query<[Omit<Membre, 'pass'>[]]>(...query);
        
        const m = response[0].map(m => MembreUninstanciator(m))
        membres.splice(0, membres.length);
        membres.push(...m);
        data.loading = false;
    })

    const trier = $((colonne: string) => {
        if(data.trie[0] === colonne) {
            data.trie[1] = data.trie[1] === 'asc' ? 'desc' : 'asc';
        }
        data.trie[0] = colonne;
        const [col, sens] = [...data.trie] // deep copy
        setTimeout(() => {
            if(col !== data.trie[0] || sens !== data.trie[1]) {
                return
            }
            // @ts-ignore
            const sorted = sort(membres, sens, t => t[col])
            membres.splice(0, membres.length);
            membres.push(...sorted);
        }, 300)
    })

    const update = $(async (membre: Partial<SerializableMembre>) => {
        // On ne pas modifier un membre sans son id (aucune sécuritée)
        if(!membre.id) return false;
        
        const id = membre.id;
        delete membre.id;
        
        let poles: RecordId[] | undefined = undefined
        if(membre.poles && membre.poles.length > 0 ) {
            const response = await conn.value!.query<[{ id: RecordId }[]]>('SELECT id FROM poles WHERE nom INSIDE $noms', {
                noms: membre.poles
            })
            
            poles = response[0].map(a => a.id)
        }
        
        const membre_deserialized: Omit<Partial<SerializableMembre>, 'poles'> & { poles?: RecordId[] } = {
            poles,
            nom: membre.nom,
            prenom: membre.prenom,
            email: membre.email,
            promotion: membre.promotion,
            heures: membre.heures
        }
        
        const entries = Object
            .keys(membre_deserialized)
            // @ts-ignore / On prends les élements !== undefined
            .filter(k => !!membre[k])
            // @ts-ignore / pour utiliser Object.fromEntries: [clé, valeur] -> Object clé: valeur 
            .map(k => [k, membre_deserialized[k]])

        if(entries.length == 0) {
            return true;
        }

        // Requête SQL pour changer ces données pour le bon id.
        const query = "UPDATE membres SET " 
            + entries
                .map(([k]) => `${k} = $${k}`)
                .join(', ')
            + ` WHERE id = $id;`

        try {
            await conn.value!.query(query, {
                id: new RecordId('membres', id),
                ...Object.fromEntries(entries)
            })

            const i = membres.findIndex(m => m.id === id)
            if(i < 0) return false 
            for(const [cle, valeur] of entries) {
                if(cle == 'poles') {
                    // @ts-ignore
                    membres[i][cle] = membre.poles;
                    continue;
                }
                // @ts-ignore
                membres[i][cle] = valeur
            }
            
            return true
        } catch(e) {
            console.error(e)
            return false
        }
    })

    return <div class="relative">
        <header id="head-membres" class="p-5">
            <h1 class="font-black text-5xl leading-relaxed">
                Membres
            </h1>
            <p class="text-lg font-light">
                Liste des membres de l'association 
                <i class="text-sm"> (Notez que la liste peut vous être restreinte.)</i>
            </p>
        </header>

        <Edition 
            exit={$(() => data.edition = undefined)}
            poles={data.poles}
            update={update}
            membre={data.edition} />
        <Filtres
            promotions={data.promotions}
            poles={data.poles}
            recherche={recherche}
            filtres={filtres}/>
        {
            data.loading 
            ? <div class="w-full h-full py-32 flex items-center justify-center">
                <LuLoader2 class="animate-spin"/>
            </div>
            : <Tableau
                trie={data.trie}
                trier={trier}>
                {
                    membres.map(membre => <Ligne 
                        onDblClick$={() => {
                            if(permissions.includes('gerer_membres')) {
                                data.edition = membre;
                            }
                        }}
                        key={membre.id} 
                        ligne={[
                            membre.id,
                            membre.nom,
                            membre.prenom,
                            membre.heures,
                            membre.poles.join(', '),
                            membre.promotion
                        ]}
                    />)
                }
            </Tableau>
        }
    </div>
})

export const head: DocumentHead = {
    title: "Tidee - Membres"
};