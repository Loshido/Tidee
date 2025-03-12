import { $, component$, useContext, useSignal, useStore, useVisibleTask$ } from "@builder.io/qwik";
import { useNavigate } from "@builder.io/qwik-city";
import { LuPlus } from "@qwikest/icons/lucide";
import { RecordId } from "surrealdb";
import { until } from "~/components/membres/utils";
import { connectionCtx, notificationsCtx, permissionsCtx } from "~/routes/layout";
import type { Membres, Membre, Utilisateur } from "./types";
import Modify from "./modify";
import Lists from "./lists";

// Le temps entre chaque touche pour que l'entrée soit validée.
// (si tu écris très vite, ça sert à rien de faire autant de
//  requêtes que de lettres...)
const DEBOUNCE_TIME = 200; // en ms

export default component$(() => {
    const conn = useContext(connectionCtx)
    const permissions = useContext(permissionsCtx)
    const notifications = useContext(notificationsCtx)

    // permet de changer de page programmatiquement
    const nav = useNavigate()

    // DEBUG: on stocke le temps que prends la requête
    const timeToSearch = useSignal(0)
    // on stocke les permissions que l'utilisateur peut donner.
    const permissionsList = useStore<string[]>([]);
    // on stocke les pôles attribuables.
    const polesList = useStore<string[]>([]);
    // L'utilisateur que l'on modifie.
    const utilisateur = useSignal<Utilisateur | undefined>()

    // Les membres que l'on peut modifier.
    const membres = useStore<{
        id: string,
        membre: string
    }[]>([])

    // Initilisation.
    useVisibleTask$(async () => {
        // On attend que la connection avec la BDD soit établit.
        await until(() => permissions.length > 0 && !!conn.value, 1000, () => {
            nav('/admin/')
        })

        // Pour avoir accès à cette page vous devez avoir les permissions "gerer_membres"
        if(!permissions.includes('gerer_membres')) {
            nav('/admin/')
        }

        // On charge les permissions et les pôles.
        const [ [ liste ], poles ] = await conn.value!.query<[ [ {
            permissions: RecordId[]
        }? ], RecordId[] ]>(
            `SELECT permissions FROM membres WHERE id = $session.rd; SELECT VAlUE id FROM poles;`);

        liste?.permissions.forEach(perm => {
            permissionsList.push(perm.id.toString());
        })
        poles.forEach(pole => {
            polesList.push(pole.id.toString())
        })
    })

    // Gères l'entrée pour la recherche recherche
    const search = $((_event: InputEvent, html: HTMLInputElement) => {
        const recherche = html.value;

        // Debouncer.
        setTimeout(async () => {
            // Si l'entrée a été modifié entre temps, on ne fait rien.
            if(recherche !== html.value || !conn.value) {
                return;
            }
            // Si l'entrée est vide, on ne charge rien.
            if(html.value.length == 0) {
                membres.splice(0, membres.length);
                return;
            }

            // On prends la mesure de la requête
            const t = Date.now()
            // On prends les informations des membres qui correspondent à la recherche
            const [response] = await conn.value.query<Membres>(
                `SELECT id, nom, prenom FROM membres 
                WHERE 
                    string::contains(string::lowercase(nom), $search) 
                OR 
                    string::contains(string::lowercase(prenom), $search);`,
                {
                    search: recherche.toLowerCase()
                }
            );
            timeToSearch.value = Date.now() - t;
            // On peut enlever la mesure après un certains temps.
            setTimeout(() => {
                timeToSearch.value = 0;
            }, 3000)

            // On supprime les membres de la requête précédente.
            membres.splice(0, membres.length)

            // S'il n'y a aucune correspondance, on s'abstient.
            if(response.length === 0) {
                return;
            }

            // On ajoute les membres au store.
            response.forEach(membre => {
                membres.push({
                    id: membre.id.id.toString(),
                    membre: membre.nom + ' ' + membre.prenom
                })
            })


        }, DEBOUNCE_TIME);
    })

    const send = $(async (modifications: Partial<Utilisateur>) => {
        // On ne fait rien s'il n'y a pas d'id,
        // autrement, on modifierait tous les membres.
        if(!utilisateur.value) return false;
        const entries = Object.entries(modifications)
            .map(([key, value]) => {
                switch(key) {
                    case 'poles':
                        // l'entrée pôles est une liste d'enregistrement sur la BDD
                        return [key, (value as string[])
                        .map(pole => new RecordId('poles', pole))]
                    case 'permissions':
                        // l'entrée permissions est une liste d'enregistrement sur la BDD
                        return [key, (value as string[])
                        .map(permission => new RecordId('permissions', permission))]
                }
                return [key, value];
            })
        if(entries.length == 0) {
            notifications.push({
                duration: 1,
                contenu: "Aucunes modifications"
            })
            return false;
        }

        const params = entries
            .map(([key]) => `${key} = $${key}`)
            .join(', ');

        const query = `UPDATE membres SET ` + params + ` WHERE id = $id`;
        const response = await conn.value!.query<[Membre[]]>(query, {
            ...Object.fromEntries(entries),
            id: new RecordId('membres', utilisateur.value.id)
        })

        if(response[0].length === 0) {
            notifications.push({
                duration: 3,
                contenu: "Les modifications n'ont pas pu être émisent"
            })
        } else {
            notifications.push({
                duration: 3,
                contenu: "Membre modifié avec succès"
            })
        }

        console.info(response)
        return true
    })

    const suppression = $(async () => {
        if(!utilisateur.value) {
            return
        }
        if(!permissions.includes('supprimer_membres')) {
            notifications.push({
                duration: 5,
                contenu: "Vous n'avez pas les permissions pour supprimer un membre."
            })
            return;
        }

        const response = await conn.value!.query<[unknown[], unknown[]]>(`
            UPDATE poles SET responsables = array::filter(responsables, |$r| $r != $id)
                WHERE $id INSIDE responsables;
            DELETE $id RETURN BEFORE;
        `, {
            id: new RecordId('membres', utilisateur.value.id)
        })

        console.log(response)
        if(response[1].length == 1) {
            notifications.push({
                duration: 6,
                contenu: "Membre supprimé"
            })
            utilisateur.value = undefined;
        } else {
            notifications.push({
                duration: 6,
                contenu: "Le membre n'a pas été supprimer correctement."
            })
            
        }
        
    })

    const selectMembre = $(async (membre: { id: string, membre: string }) => {
        membres.splice(0, membres.length)
        const input = document.getElementById('recherche-membres') as HTMLInputElement | null;
        if(input) {
            input.value = ''
        }

        const [ [ m ] ] = await conn.value!.query<[[Membre?]]>(
            `SELECT * FROM $membre`,
            {
                membre: new RecordId('membres', membre.id)
            }
        );

        if(m) {
            utilisateur.value = {
                ...m,
                id: m.id.id.toString(),
                permissions: m.permissions.map(permission => 
                    permission.id.toString()),
                poles: m.poles.map(pole => pole.id.toString())
            }
        }
    })

    return <section class="flex flex-col w-full h-screen">
        <div class="relative">
            <span class="absolute bottom-0 left-0 text-xs text-black/15">
                {
                    timeToSearch.value === 0 
                    ? null
                    : timeToSearch.value + ' ms'
                }
            </span>
            <input 
                id="recherche-membres"
                onInput$={search}
                class="p-5 text-xl border-b outline-none w-full"
                placeholder="Rechercher un membre"
                type="search"/>
            <Lists
                membres={membres}
                select={selectMembre}/>
        </div>
        {
            utilisateur.value !== undefined
            ? <Modify
                utilisateur={utilisateur.value}
                permissions={permissionsList}
                poles={polesList}
                actions={{
                    send,
                    suppression
                }}/>
            : <section class="p-2">
                <div
                    class="w-fit px-2 py-1 border rounded flex flex-row gap-2 items-center 
                    hover:bg-blue-400 hover:bg-opacity-5 transition-colors cursor-pointer select-none">
                    <LuPlus class="w-4 h-4"/>
                    Ajouter un membre
                </div>
                {/* Todo: ajouter un membre */}
            </section> 
        }
    </section>
})