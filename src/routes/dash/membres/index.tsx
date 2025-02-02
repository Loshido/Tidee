import { $, component$, noSerialize, NoSerialize, useContext, useStore, useVisibleTask$ } from "@builder.io/qwik";

import "./style.css"
import { connectionCtx, permissionsCtx } from "~/routes/layout";
import { cache } from "~/lib/local";
import Tableau, { Ligne } from "~/components/membres/Tableau";
import { LuLoader2 } from "@qwikest/icons/lucide";

import Filtres from "~/components/membres/Filtres";
import { SerializableMembre, MembreUninstanciator, until } from "~/components/membres/utils";
import { selectPoles, selectPromotions, SelectQuery } from "~/components/membres/Queries";
import sort from "~/components/membres/Sort";
import Edition from "~/components/membres/Edition";

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
            "id, email, heures, nom, prenom, array::join(array::map(poles, |$v| $v.nom), ', ') AS poles, promotion", 'membres'))
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

    return <div class="relative">
        <header id="head-membres" class="p-5">
            <h1 class="font-black text-4xl leading-relaxed lg">
                Membres
            </h1>
            <p class="text-lg font-light">
                Liste des membres de l'association 
                <i class="text-sm"> (Notez que la liste peut vous être restreinte.)</i>
            </p>
        </header>

        <Edition 
            exit={$(() => data.edition = undefined)}
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
                            membre.poles,
                            membre.promotion
                        ]}
                    />)
                }
            </Tableau>
        }
    </div>
})