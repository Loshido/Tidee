import { $, component$, useContext, useSignal, useStore, useVisibleTask$ } from "@builder.io/qwik";
import { useNavigate } from "@builder.io/qwik-city";
import { RecordId } from "surrealdb";
import { until } from "~/components/membres/utils";
import { connectionCtx, permissionsCtx } from "~/routes/layout";

const DEBOUNCE_TIME = 200;
type Membres = [{
    id: RecordId,
    nom: string,
    prenom: string
}[]]

type Membre = {
    id?: RecordId
    nom: string,
    prenom: string,
    heures: number,
    email: string,
    promotion: string,
    permissions: RecordId[],
    poles: RecordId[],
}
type Utilisateur = undefined | Omit<Membre, 'permissions' | 'poles' | 'id'> & {
    permissions: string[],
    poles: string[],
}
export default component$(() => {
    const conn = useContext(connectionCtx)
    const permissions = useContext(permissionsCtx)
    const nav = useNavigate()
    const timeToSearch = useSignal(0)
    const utilisateur = useSignal<Utilisateur>()
    const membres = useStore<{
        id: string,
        membre: string
    }[]>([])

    useVisibleTask$(async () => {
        await until(() => permissions.length > 0 && !!conn.value, 25, 1000, () => {
            nav('/admin/')
        })

        if(!permissions.includes('gerer_membres')) {
            nav('/admin/')
        }
    })

    const search = $((_event: InputEvent, html: HTMLInputElement) => {
        const recherche = html.value;

        setTimeout(async () => {
            if(recherche !== html.value || !conn.value) {
                return;
            }
            if(html.value.length == 0) {
                membres.splice(0, membres.length);
                return;
            }

            const t = Date.now()
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
            setTimeout(() => {
                timeToSearch.value = 0;
            }, 3000)

            membres.splice(0, membres.length)

            if(response.length === 0) {
                return;
            }

            response.forEach(membre => {
                membres.push({
                    id: membre.id.id.toString(),
                    membre: membre.nom + ' ' + membre.prenom
                })
            })


        }, DEBOUNCE_TIME);
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
                    class="absolute top-full left-0 w-full max-h-96 bg-white border-b
                    grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 
                    overflow-y-scroll">
                    {
                        membres.map(membre => <div key={membre.id}
                            class="px-3 py-2 w-full 
                                border border-black/5 border-collapse border-dashed
                                hover:bg-black/10 cursor-pointer"
                            onClick$={async () => {
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
                                    delete m.id;
                                    utilisateur.value = {
                                        ...m,
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
        <pre>
            {
                JSON.stringify(utilisateur.value, undefined, 4)
            }
        </pre>
        
        <ol class="list-inside list-decimal px-2">
            <li>On peut modifier tous les données relatifs à cette utilisateur</li>
            <li>possibilité de supprimer ou ajouter un utilisateur</li>
        </ol>
    </section>
})