import { component$, type JSXOutput, Slot, useContext, useSignal, useTask$, useVisibleTask$ } from "@builder.io/qwik";
import { Link, type LinkProps, useDocumentHead, useLocation, useNavigate } from "@builder.io/qwik-city";

export const NavItem = component$(({ active, ...props}: LinkProps & { active?: boolean }) => <Link {...props}
    class={["flex flex-row gap-2 items-center px-3 py-1.5",
        "hover:bg-black hover:bg-opacity-10 rounded",
        "cursor-pointer select-none transition-colors",
        active ? 'bg-black bg-opacity-10' : '']}>
    <Slot/>
</Link>)

type Lien = {
    path: string,
    slot: JSXOutput,
    name?: string,
    permissions?: string[] // permissions requises pour aller à un page
}
const liens: Lien[] = [
    {
        path: '/admin/',
        slot: <>
            <LuSatellite class="w-5 h-5 sm:w-4 sm:h-4" />
            Accueil
        </>,
    },
    {
        path: '/admin/membres/',
        slot: <>
            <LuUsers class="w-5 h-5 sm:w-4 sm:h-4"/>
            Membres
        </>,
        permissions: ['gerer_membres']
    },
    {
        path: '/admin/poles/',
        slot: <>
            <LuTags class="w-5 h-5 sm:w-4 sm:h-4"/>
            Pôles
        </>,
        permissions: ['modifier_poles']
    },
    {
        path: '/admin/logs/',
        slot: <>
            <LuFileClock class="w-5 h-5 sm:w-4 sm:h-4"/>
            Logs
        </>,
        permissions: ['voir_logs']
    },
    {
        path: '/admin/parametres/',
        slot: <>
            <LuFileCog class="w-5 h-5 sm:w-4 sm:h-4"/>
            Paramètres
        </>
    }

]


import { LuAlignLeft, LuFileClock, LuFileCog, LuSatellite, LuSquareSlash, LuTags, LuUsers } from "@qwikest/icons/lucide"
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
            <p class="font-medium">
                {
                    liens.find(lien => lien.path == loc.url.pathname)?.name || ' '
                }
            </p>
        </div>
        <div class={["w-full h-full flex-col sm:justify-between items-center gap-2 sm:gap-1",
            "p-5 border-r text-xl sm:text-sm sm:flex text-center sm:text-left bg-white",
            menu.value ? "flex relative top-0 left-0 w-full" : "hidden"]}>
            <div class="flex flex-col gap-2 sm:gap-1 w-full">
                {
                    liens.map(lien => {
                        if(lien.permissions && !lien.permissions.every(permission => permissions.includes(permission))) {
                            return null;
                        }

                        return <NavItem
                            key={lien.path}
                            active={loc.url.pathname == lien.path}
                            href={lien.path}>
                            {lien.slot}
                        </NavItem>
                    })
                }
            </div>
            <div class="flex flex-col gap-2 sm:gap-1 w-full">
                <NavItem href="/dash/">
                    <LuSquareSlash class="w-5 h-5 sm:w-4 sm:h-4"/>
                    Tableau de board
                </NavItem>
            </div>
        </div>
        <div class="w-full h-full overflow-auto">
            <Slot/>
        </div>
    </section>
})