import { component$, isDev, type JSXOutput, Slot, useContext, useSignal, useTask$ } from "@builder.io/qwik";
import { Link, type LinkProps, useDocumentHead, useLocation } from "@builder.io/qwik-city";

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
        path: '/dash/',
        slot: <>
            <LuSquareSlash class="w-5 h-5 sm:w-4 sm:h-4" />
            Accueil
        </>,
        name: 'Accueil'
    },
    {
        path: '/dash/membres/',
        slot: <>
            <LuUsers class="w-5 h-5 sm:w-4 sm:h-4" />
            Membres
        </>,
        name: 'Membres'
    },
    {
        path: '/dash/poles/',
        slot: <>
            <LuTags class="w-5 h-5 sm:w-4 sm:h-4" />
            Pôles
        </>,
        name: 'Pôles'
    },
    {
        path: '/dash/planning/',
        slot: <>
            <LuCalendarDays class="w-5 h-5 sm:w-4 sm:h-4" />
            Planning
        </>,
        name: 'Planning',
        permissions: [
            'planning_voir'
        ]
    },
    {
        path: '/dash/notifications/',
        slot: <>
            <LuMessageSquare class="w-5 h-5 sm:w-4 sm:h-4"/>
            Notifications
        </>,
        name: 'Notifications',
        permissions: [
            'notifications'
        ]
    },
]

import { LuAlignLeft, LuBug, LuCalendarDays, LuClipboardCheck, LuLogOut, LuMessageSquare, LuSettings, LuSquareSlash, LuTags, LuUsers } from "@qwikest/icons/lucide"
import { permissionsCtx } from "../layout";
export default component$(() => {
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
                    liens.find(lien => lien.path == loc.url.pathname)?.name || ' Perdu ... '
                }
            </p>
        </div>
        <div class={["w-full h-full flex-col sm:justify-between items-center gap-2 sm:gap-1",
            "p-5 border-r text-xl sm:text-sm sm:flex text-center sm:text-left",
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
                {
                    isDev && <NavItem 
                        active={loc.url.pathname.startsWith('/dash/debug/')} href="/dash/debug/">
                        <LuBug class="w-5 h-5 sm:w-4 sm:h-4"/>
                        Debug
                    </NavItem>
                }
                {
                    // Si l'utilisateur est responsable d'un pôle
                    permissions.some(permission => 
                        permission.startsWith('modifier_pole_') 
                        || permission === 'modifier_poles') &&  <NavItem 
                        active={loc.url.pathname == '/dash/appels/'} href="/dash/appels/">
                        <LuClipboardCheck class="w-5 h-5 sm:w-4 sm:h-4"/>
                        Appel
                    </NavItem>
                }
                <NavItem active={loc.url.pathname == '/dash/parametres/'}>
                    <LuSettings class="w-5 h-5 sm:w-4 sm:h-4"/>
                    Paramètres
                </NavItem>
                <NavItem href="/deconnexion">
                    <LuLogOut class="w-5 h-5 sm:w-4 sm:h-4"/>
                    Déconnexion
                </NavItem>
            </div>
        </div>
        <div class="w-full h-full overflow-auto">
            <Slot/>
        </div>
    </section>
})