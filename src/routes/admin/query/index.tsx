import { component$, useContext, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import { useNavigate } from "@builder.io/qwik-city";
import { until } from "~/components/membres/utils";
import { connectionCtx, notificationsCtx, permissionsCtx } from "~/routes/layout";

export default component$(() => {
    const nav = useNavigate();
    const permissions = useContext(permissionsCtx);
    const notifications = useContext(notificationsCtx)
    const conn = useContext(connectionCtx)
    const reponse = useSignal('')

    // Initilisation.
    useVisibleTask$(async () => {
        // On attend que la connection avec la BDD soit établit.
        await until(() => permissions.length > 0 && !!conn.value, 1000, () => {
            nav('/admin/')
        })

        if(!permissions.includes('requetes_libres')) {
            nav('/admin/')
        }
    })

    return <section class="p-5">
        <h1 class="font-semibold text-xl">
            Requêtes à la base de données
        </h1>
        <p>
            Le language des requêtes est le <a 
                href="https://surrealdb.com/docs/surrealql" 
                target="_blank"
                class="text-purple-700 font-medium">
                SurrealQL
            </a> (un dérivé de SQL).
        </p>
        <div class="relative m-2">
            <p class="text-xs m-1 text-black/5°">Requête</p>
            <pre id="requete" class="min-h-96 p-3 outline-none border resize-y" contentEditable="true">
                SELECT * FROM membres
            </pre>
            <button class="px-3 py-1 bg-purple-700 text-white font-medium
                hover:bg-purple-500 transition-colors
                absolute bottom-2 left-2"
                onClick$={async () => {
                    const pre = document.getElementById('requete') as HTMLPreElement | null;
                    if(!pre) {
                        notifications.push({
                            duration: 3,
                            contenu: "Requête introuvable."
                        })
                        return;
                    }   
                    const perms = await conn.value!.query<[string[]]>(
                        // fn::permissions(...) -> RecordId[]
                        // array::map iterates over each RecordId 
                        // and casts it into string
                        'array::map(fn::permissions($session.rd), |$r| <string> $r)')
                    if(!perms[0].includes('permissions:requetes_libres')) {
                        notifications.push({
                            duration: 3,
                            contenu: "Vous n'avez pas les permissions nécessaires!"
                        })
                        return;
                    }

                    const requete = pre.innerText;

                    try {
                        const data = await conn.value!.query(requete);
                        reponse.value = JSON.stringify(data, undefined, 4)
                    } catch(error) {
                        if(error && typeof error === 'object' && 'message' in error) {
                            reponse.value = JSON.stringify(error.message, undefined, 4)
                            return;
                        }
                        reponse.value = JSON.stringify(error, undefined, 4)
                    }
                }}>
                Executer
            </button>
        </div>

        <div class="m-2">
            <p class="text-xs m-1 text-black/5°">Réponse</p>
            <pre class="min-h-32 p-3 border overflow-ellipsis overflow-x-hidden">
                {
                    reponse.value
                }
            </pre>
        </div>
    </section>
})