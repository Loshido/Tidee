import { $, component$, useContext, useSignal, useStore, useVisibleTask$ } from "@builder.io/qwik";
import { useNavigate } from "@builder.io/qwik-city";
import { LuArrowDownToLine, LuShield, LuTags, LuX } from "@qwikest/icons/lucide";
import { RecordId } from "surrealdb";
import Entree from "~/components/admin/entree";
import Select from "~/components/admin/select";
import { until } from "~/components/membres/utils";
import { connectionCtx, notificationsCtx, permissionsCtx } from "~/routes/layout";
import type { Membres, Membre, Utilisateur } from "./types";
import Suppression from "./suppression";

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
    const modifications = useStore<Partial<Utilisateur>>({})

    // Les membres que l'on peut modifier.
    const membres = useStore<{
        id: string,
        membre: string
    }[]>([])

    // Initilisation.
    useVisibleTask$(async () => {
        // On attend que la connection avec la BDD soit établit.
        await until(() => permissions.length > 0 && !!conn.value, 25, 1000, () => {
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
            const [response] = await conn.value?.query<Membres>(
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

    const send = $(async () => {
        // On ne fait rien s'il n'y a pas d'id,
        // autrement, on modifierait tous les membres.
        if(!utilisateur.value) return;
        const entries = Object.entries(modifications)
            // On garde uniquement les entrées modifiées
            .filter(entry => entry[1] !== undefined)
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
            return;
        }

        const params = entries
            .map(([key, _]) => `${key} = $${key}`)
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
            {
                membres.length !== 0 && <div 
                    class="z-20 absolute top-full left-0 w-full max-h-96 bg-white border-b
                    grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 
                    overflow-y-scroll">
                    {
                        membres.map(membre => <div key={membre.id}
                            class="px-3 py-2 w-full 
                                border border-black/5 border-collapse border-dashed
                                hover:bg-black/10 cursor-pointer"
                            onClick$={async () => {
                                Object.keys(modifications).forEach(key => {
                                    // @ts-ignore
                                    delete modifications[key]
                                })
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
                            }}>
                            {membre.membre}
                        </div>)
                    }
                </div>
            }
        </div>
        {
            utilisateur.value && <section class="p-5 flex flex-col gap-2">
                <div class="flex flex-row flex-wrap gap-2">
                    <Entree
                        name="Adresse mail"
                        type="text"
                        onInput$={(_, t) => modifications.email = t.value}
                        value={utilisateur.value.email}/>
                    <Entree
                        name="Nom"
                        type="text"
                        onInput$={(_, t) => modifications.nom = t.value}
                        value={utilisateur.value.nom}/>
                    <Entree
                        name="Prénom"
                        type="text"
                        onInput$={(_, t) => modifications.prenom = t.value}
                        value={utilisateur.value.prenom}/>
                    <Entree
                        name="Promotion"
                        type="text" class="w-28"
                        onInput$={(_, t) => modifications.promotion = t.value}
                        value={utilisateur.value.promotion}/>
                    <Entree
                        name="Heures"
                        type="number" class="w-24"
                        onInput$={(_, t) => modifications.heures = parseInt(t.value) || undefined}
                        value={utilisateur.value.heures}/>
                </div>
                <div class="flex flex-row flex-wrap gap-2">
                    <Select
                        items={permissionsList.map(permission => ({
                            active: utilisateur.value!.permissions.includes(permission),
                            onClick: $(() => {
                                const i = utilisateur.value!.permissions.indexOf(permission);
                                if(i !== undefined && i !== -1) {
                                    utilisateur.value!.permissions.splice(i, 1);
                                } else {
                                    utilisateur.value!.permissions.push(permission)
                                }

                                // On réplique pour que les modifications soient prises en compte.
                                modifications.permissions = utilisateur.value!.permissions
                            }),
                            slot: <>
                                {permission}
                            </>
                        }))}>
                        <LuShield/>
                        Permissions
                    </Select>
                    <Select
                        items={polesList.map(pole => ({
                            active: utilisateur.value!.poles.includes(pole),
                            onClick: $(() => {
                                const i = utilisateur.value!.poles.indexOf(pole);
                                if(i !== undefined && i !== -1) {
                                    utilisateur.value!.poles.splice(i, 1);
                                } else {
                                    utilisateur.value!.poles.push(pole)
                                }

                                modifications.poles = utilisateur.value!.poles
                            }),
                            slot: <>
                                {pole}
                            </>
                        }))}>
                        <LuTags/>
                        Pôles
                    </Select>
                </div>
                <div class="flex flex-row flex-wrap gap-2">
                    <div onClick$={send}
                        class="px-2 py-1 border rounded flex flex-row gap-2 items-center 
                         hover:bg-blue-400 hover:bg-opacity-5 transition-colors cursor-pointer select-none">
                        <LuArrowDownToLine class="w-4 h-4"/>
                        Enregistrer
                    </div>
                    <Suppression
                        name={utilisateur.value.prenom}
                        delete={suppression}/>
                </div>
            </section>
        }
        
        {/* <ol class="list-inside list-decimal px-2">
            <li>On peut modifier tous les données relatifs à cette utilisateur</li>
            <li>possibilité de supprimer ou ajouter un utilisateur</li>
        </ol> */}
    </section>
})