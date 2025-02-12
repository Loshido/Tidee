// Qwik & Qwik City
import { $, component$, isBrowser, useContext, useStore, useTask$, useVisibleTask$ } from "@builder.io/qwik";
import { useNavigate, type DocumentHead } from "@builder.io/qwik-city";

// Utilitaires
import { SelectQuery } from "~/components/membres/Queries";
import { MembreUninstanciator, until } from "~/components/membres/utils";
import storage, { cache } from "~/lib/local";
// Contextes
import { connectionCtx, notificationsCtx, permissionsCtx } from "~/routes/layout";
// Fonction de trie
import sort from "~/components/membres/Sort";
// CSS
import "./style.css"
// Types du fichier
import type { AppelState, Colonnes, MembreAppel } from "./types";

// Composants
//////////////////////////
// Icones
import { LuArrowDownToLine, LuSend, LuTag } from "@qwikest/icons/lucide";
// Selecteur
import Select from "~/components/select";
// Composants de la page
import { Entete, Ligne } from "./composants";
import { RecordId } from "surrealdb";

export default component$(() => {
    const conn = useContext(connectionCtx);
    const permissions = useContext(permissionsCtx);
    const notifications = useContext(notificationsCtx);
    const nav = useNavigate()

    const membres = useStore<MembreAppel[]>([]);
    const state = useStore<AppelState>({
        poles: [],
        date: new Date(),
        trie: 'nom',
        trie_direction: 'asc',
        synced: false,
        last_sent: 0
    })

    // Change le pôle pour lequel on fait l'appel;
    const selectPole = $((id: string) => {
        const pole = state.poles.find(p => p.id === id);
        if(pole) {
            state.pole = pole.nom
        }
    })

    // Trie une nouvelle colonne ou change la direction du trie
    const changerTrie = $((colonne: Colonnes) => {
        if(state.trie === colonne) {
            state.trie_direction = state.trie_direction === 'asc' ? 'desc' : 'asc'
        } else {
            state.trie = colonne
            state.trie_direction = 'asc'
        }
    })

    const heures_sup = {
        ajouter: $((id: string) => {
            const i = membres.findIndex(m => m.id === id)
            if(i >= 0 && membres[i].heures_sup < 8) {
                membres[i].heures_sup += 1
            }
        }),
        retirer: $((id: string) => {
            const i = membres.findIndex(m => m.id === id)
            if(i >= 0 && membres[i].heures_sup > -8 && membres[i].heures + membres[i].heures_sup > 0) {
                membres[i].heures_sup -= 1
            }
        })
    }

    const send = $(async () => {
        if(!state.pole || state.last_sent + 1000 * 5 > Date.now()) return;
        state.last_sent = Date.now() // évite que les utilisateurs spamment le bouton.
        const heures: AppelData[] = [];

        membres
            .filter(m => state.pole && m.poles.includes(state.pole) && m.heures_sup !== 0)
            .forEach(m => {
                if(m.heures_sup > 8 || -8 > m.heures_sup) return;
                heures.push({
                    heures: m.heures_sup,
                    id: new RecordId('membres', m.id),
                    before: m.heures
                });
            });

        const date = state.date.toLocaleDateString('fr-FR', {
            dateStyle: 'short'
        });

        const p = state.poles.find(p => p.nom === state.pole)
        if(!p) return;

        const pole = new RecordId('poles', p.id)
        const response = await conn.value!.query<[null, unknown[], null]>(
            // 1. On retire les heures ajoutés avant (s'il y en avait par précaution)
            // 2. On mets à jours l'appel
            // 3. On applique la mise à jours des heures
            `
            FOR $ligne IN 
                (SELECT VALUE heures FROM appels WHERE date = '10/02/2025' AND pole = poles:serveur) {
                FOR $h IN $ligne {
                    UPDATE $h.id SET heures = $h.before;
                };
            };
            UPSERT appels CONTENT {
                date: $date,
                heures: $heures,
                pole: $pole,
                responsable: $session.rd
            };
            FOR $h IN $heures {
                UPDATE $h.id SET heures = $h.before + $h.heures
            };
            `, 
            {
                date,
                pole,
                heures
            }   
        );
        state.synced = response[1].length > 0;
        notifications.push({
            duration: 5,
            contenu: `Vous avez fait l'appel du ${date} pour ${heures.length} membres.`
        })

        // we remove the current cache since it is not reliable. 
        localStorage.removeItem('.:list-membre')
    })

    // Tâche côté serveur ou pas
    useTask$(() => {
        // Toutes les appels d'une semaine seront stockés au premier jour de la semaine,
        // pour réduire les logs
        const d = Date.now() - (new Date().getDay() - 1) * 24 * 60 * 60 * 1000
        const date = new Date(d);
        state.date = date;
    })

    // On syncronise avec une appel potentiellement déjà faite.
    useTask$(async ({ track }) => {
        track(() => state.pole);
        if(!isBrowser) return;

        // L'identifiant de la semaine (ex: 10/02/2025)
        const date = state.date.toLocaleDateString('fr-FR', {
            dateStyle: 'short'
        })
        // On forme le RecordId du pole en question s'il est dispo
        const p = state.poles.find(p => p.nom === state.pole)
        if(!p) return;

        const pole = new RecordId('poles', p.id)
        
        const [[heures]] = await conn.value!.query<[[AppelData[]?]]>(
            `SELECT VALUE heures FROM appels WHERE date = $date AND pole = $pole`,
            {
                date,
                pole
            }
        )
        state.synced = false;
        if(!heures) return; 
        state.synced = heures.length > 0

        // On transforme la liste en object pour avoir un accès O(1)
        // ça évite de faire une boucle dans une boucle et se retrouver à O(n^2)
        const o: { [key: string]: number } = {}
        heures.forEach(h => o[h.id.id.toString()] = h.heures)

        membres.forEach(m => {
            if(m.id in o) {
                m.heures -= o[m.id]
                m.heures_sup = o[m.id]
            };
        })
    })

    // On traque si les paramètres du trie changent
    useTask$(({ track }) => {
        track(() => state.trie)
        track(() => state.trie_direction)

        if(!state.trie) return;

        // @ts-ignore
        const sorted = sort(membres, state.trie_direction, t => t[state.trie])
        membres.splice(0, membres.length);
        membres.push(...sorted);
    })

    useVisibleTask$(async () => {
        await until(() => !!conn.value);

        // On restreint l'accès à l'appel
        if(!permissions.some(permission => permission.startsWith('modifier_pole'))) {
            notifications.push({
                contenu: "Vous n'êtes pas responsable aux yeux du système!",
                duration: 3
            })
            nav('/dash/');
        }

        // On récupère les pôles pour lesquels l'utilisateur est responsable.
        const poles = await conn.value!.query<[Pole[]]>(
            `SELECT id, nom FROM poles 
            WHERE 
                $session.rd INSIDE responsables 
            OR permissions:modifier_poles INSIDE fn::permissions($session.rd)`);

        // les "id" sont en RecordID (<=> non serialisable par Qwik)
        state.poles.push(...poles[0].map(pole => ({
            id: pole.id.id.toString(),
            nom: pole.nom
        })))

        // Un constructeur de query pour simplifier les filtres.
        const builder = new SelectQuery(
            `id, email, heures, nom, prenom, 
            array::map(poles, |$v| $v.nom) AS poles, 
            promotion`, 
            'membres'
        );

        // On partage le même cache que la page /dash/membres
        // ça évite d'avoir à mettre un autre cache ou de faire une requête supplémentaire.

        // On prends tous les membres parce que l'appel doit pouvoir être dynamique.
        // Autant trier les pôles côté client, on le fait déjà sur la pages membres.
        const cached_membres = await cache('list-membre', 60 * 5, async () => {
            const query = builder.query();
            const response = await conn.value!.query<[Omit<Membre, 'pass'>[]]>(...query);
            return response[0].map(m => MembreUninstanciator(m));
        })

        membres.push(...cached_membres.map(m => ({
            ...m,
            heures_sup: 0
        })))

        if(state.poles.length === 1 ) {
            await selectPole(state.poles[0].id);
        }
    })

    return <section>
        <div class="text-2xl font-medium p-5 sm:p-10
            flex flex-row flex-wrap gap-x-2 items-center">
            Appel du pôle 
            <Select
                selected={state.pole}
                nom="sélection du pôle"
                items={state.poles}
                select={selectPole}/>
            pour la semaine du {state.date.toLocaleDateString(undefined, {
                dateStyle: 'medium'
            })}
        </div>
        {
            state.pole
            ? <div class="appel w-full flex flex-col gap-0">
                <div class="ligne tete font-semibold">
                    <Entete
                        trie={{
                            change: changerTrie,
                            colonne: state.trie || '',
                            direction: state.trie_direction
                        }}
                        colonne="nom">
                        Nom
                    </Entete>
                    <Entete
                        trie={{
                            change: changerTrie,
                            colonne: state.trie || '',
                            direction: state.trie_direction
                        }}
                        colonne="prenom">
                        Prénom
                    </Entete>
                    <Entete
                        trie={{
                            change: changerTrie,
                            colonne: state.trie || '',
                            direction: state.trie_direction
                        }}
                        colonne="heures">
                        Heures
                    </Entete>
                    <div class="cube" onClick$={() => {
                        membres.forEach(m => {
                            if(m.heures_sup < 8) {
                                m.heures_sup += 1
                            }
                        })
                    }}>
                        +
                    </div>
                    <div class="cube" onClick$={() => {
                        membres.forEach(m => {
                            if(m.heures_sup > -8) {
                                m.heures_sup -= 1
                            }
                        })
                    }}>
                        -
                    </div>
                </div>
                {
                    membres
                        .filter(m => state.pole && m.poles.includes(state.pole || ''))
                        .map(membre => <Ligne
                            key={membre.id}
                            membre={membre}
                            plus={heures_sup.ajouter}
                            minus={heures_sup.retirer}
                        /> )
                }
            </div>
            : <div class="w-full h-full flex flex-row gap-2 items-center justify-center min-h-96 font-medium">
                <LuTag/>
                Vous devez choisir le pôle pour lequel vous voulez faire l'appel!
            </div>
        }
        <div class="p-5 sm:p-10
            flex flex-row flex-wrap gap-x-2 items-center">
            {
                state.pole && <div class="px-2 py-1 border rounded flex flex-row gap-2 items-center 
                hover:bg-black hover:bg-opacity-5 transition-colors cursor-pointer select-none"
                onClick$={send}>
                    {
                        state.synced 
                        ? <>
                            <LuArrowDownToLine class="w-4 h-4"/>
                            Enregistrer
                        </> 
                        : <>
                            <LuSend class="w-4 h-4"/>
                            Envoyer
                        </>
                    }
                </div>
            }
            
        </div>
    </section>
})

export const head: DocumentHead = {
    title: "Tidee - Appels"
};