import { $, component$, useContext, useStore, useVisibleTask$ } from "@builder.io/qwik";
import { type DocumentHead, Link } from "@builder.io/qwik-city";
import { LuArrowUpRight, LuAsterisk, LuLock, LuMessageSquare } from "@qwikest/icons/lucide";
import Dialog from "~/components/utils/dialog";
import storage from "~/lib/local";
import { notificationsCtx } from "~/routes/layout";



export default component$(() => {
    const notifications = useContext(notificationsCtx)
    const cache = useStore({
        details: "",
        open: false
    })
    
    useVisibleTask$(async () => {
        const keys = await storage.keys();
        cache.details = `${keys.length} entrées en cache.`
    })
    
    const closeCacheConfirmation = $(() => {
        cache.open = false;
    })
    const clearCache = $(async () => {
        const keys = [];
        for(let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if(key && key.startsWith(".:")) {
                keys.push(key);
            }
        }
        keys.forEach(key => localStorage.removeItem(key));
        notifications.push({
            duration: 4,
            contenu: 'Suppression du cache.'
        })
        cache.open = false;
    })

    return <section class="grid grid-rows-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 h-full w-full">
        <Link class="border h-full w-full p-5 rounded
            hover:bg-black/5 transition-colors cursor-pointer select-none"
            href="/dash/parametres/password">
            <div class="flex flex-row gap-2 items-center text-lg font-semibold mb-2">
                <LuLock/>
                Modifier votre mots de passe
            </div>
            <p class="text-sm">
                Créer un nouveau mots de passe en utilisant votre mots de passe actuel
            </p>
        </Link>
        <div class="border h-full w-full p-5 rounded
            hover:bg-black/5 transition-colors cursor-pointer select-none"
            onClick$={() => cache.open = true}>
            <div class="flex flex-row gap-2 items-center text-lg font-semibold mb-2">
                <LuAsterisk/>
                Effacer le cache
            </div>
            <p class="text-sm">
                Des informations ne sont plus à jours ? 
                Forcez les mises à jours.
            </p>
            <em class="text-sm">
                {cache.details}
            </em>
        </div>
        <Dialog
            open={cache.open}
            message="Êtes vous sûr de vouloir supprimer le cache ?"
            close={closeCacheConfirmation}
            actions={[
                {
                    slot: <p class="px-3 py-1 text-white font-semibold 
                    bg-pink-600 hover:bg-pink-400">
                        Supprimer
                    </p>,
                    onClick: clearCache
                },
                {
                    slot: <p class="px-3 py-1 bg-black/10 hover:bg-black/5">
                        Revenir
                    </p>,
                    onClick: closeCacheConfirmation
                }
            ]}/>
        <Link class="border h-full w-full p-5 rounded
            hover:bg-black/5 transition-colors cursor-pointer select-none"
            href="https://github.com/Loshido/Tidee/issues/new?labels=report"
            target="_blank">
            <div class="flex flex-row gap-2 items-center text-lg font-semibold mb-2">
                <LuMessageSquare/>
                Faire un retour
                <LuArrowUpRight class="w-3 h-3 mb-2 -ml-1"/>
            </div>
            <p class="text-sm">
                Partagez un avis, des erreurs, des idées ou encore des plaintes!
            </p>
        </Link>
    </section>
})

export const head: DocumentHead = {
    title: "Tidee - Paramètres",
    meta: [
        {
            name: "description",
            content: "Une solution de gestion d'association",
        },
    ],
};