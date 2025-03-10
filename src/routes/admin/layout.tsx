import { component$, Slot, useContext, useSignal, useTask$, useVisibleTask$ } from "@builder.io/qwik";
import { useDocumentHead, useLocation, useNavigate } from "@builder.io/qwik-city";

import AdminNavigation from "~/components/nav/admin"
import { LuAlignLeft } from "@qwikest/icons/lucide"
import { permissionsCtx } from "../layout";
import { until } from "~/components/membres/utils";
export default component$(() => {
    const nav = useNavigate()
    const menu = useSignal(false)
    const loc = useLocation()
    const head = useDocumentHead()
    const permissions = useContext(permissionsCtx)

    useTask$(({ track }) => {
        // On ferme le menu lorsque l'on change de page.
        track(() => loc.url.pathname);
        menu.value = false;
    })

    useVisibleTask$(async () => {
        await until(() => permissions.length > 0, 25, 1000, () => {
            nav('/dash/')
        })

        if(!permissions.includes('administration')) {
            nav('/dash/')
        }
    })

    if(head.frontmatter.dash == false) {
        return <Slot/>
    }

    return <section 
        class="w-svw h-svh sm:grid overflow-hidden"
        style="grid-template-columns: auto 1fr">
        <div class="sm:hidden p-2 flex flex-row gap-3 border-b items-center">
            <div class="p-2 hover:bg-black hover:bg-opacity-10 rounded
                cursor-pointer select-none transition-colors" onClick$={() => menu.value = !menu.value}>
                <LuAlignLeft class="h-4 w-4"/>
            </div>
        </div>
        <AdminNavigation
            open={menu.value}
            permissions={permissions}/>
        <div class="w-full h-full overflow-auto">
            <Slot/>
        </div>
    </section>
})