import { component$, Slot, useContext, useSignal, useStylesScoped$, useTask$ } from "@builder.io/qwik";
import { useDocumentHead, useLocation } from "@builder.io/qwik-city";

import { LuAlignLeft } from "@qwikest/icons/lucide"
import { permissionsCtx } from "../layout";
import DashNavigation from "~/components/nav/dash"
export default component$(() => {
    useStylesScoped$(`
        #dash-layout:has(#poles-explorer) {
            display: grid;
            grid-template-rows: auto 1fr;
        }`)
    const menu = useSignal(false)
    const loc = useLocation()
    const head = useDocumentHead()
    const permissions = useContext(permissionsCtx)

    useTask$(({ track }) => {
        // On ferme le menu lorsque l'on change de page.
        track(() => loc.url.pathname);
        menu.value = false;
    })

    if(head.frontmatter.dash == false) {
        return <Slot/>
    }

    return <section id="dash-layout"
        class="w-dvw h-dvh sm:grid overflow-hidden"
        style="grid-template-columns: auto 1fr">
        <div class="sm:hidden p-2 flex flex-row gap-3 border-b items-center">
            <div class="p-2 hover:bg-black hover:bg-opacity-10 rounded
                cursor-pointer select-none transition-colors" onClick$={() => menu.value = !menu.value}>
                <LuAlignLeft class="h-4 w-4"/>
            </div>
        </div>
        <DashNavigation
            open={menu.value}
            permissions={permissions}/>
        <div class="w-full h-full overflow-auto pb-12 sm:pb-0">
            <Slot/>
        </div>
    </section>
})