import { component$, Slot, useSignal } from "@builder.io/qwik";
import { Link, LinkProps, useDocumentHead, useLocation } from "@builder.io/qwik-city";

export const NavItem = component$(({ active, ...props}: LinkProps & { active?: boolean }) => <Link {...props}
    class={["flex flex-row gap-2 items-center px-3 py-1.5",
        "hover:bg-black hover:bg-opacity-10 rounded",
        "cursor-pointer select-none",
        active ? 'bg-black bg-opacity-10' : '']}>
    <Slot/>
</Link>)

import { LuAlignLeft, LuCalendarDays, LuLogOut, LuMessageSquare, LuSettings, LuSquareSlash, LuTags, LuUsers } from "@qwikest/icons/lucide"
export default component$(() => {
    const menu = useSignal(false)
    const head = useDocumentHead()
    const loc = useLocation()

    return <section 
        class="w-svw h-svh sm:grid overflow-hidden"
        style="grid-template-columns: auto 1fr">
        <div class="sm:hidden p-2 flex flex-row gap-3 border-b items-center">
            <div class="p-2 hover:bg-black hover:bg-opacity-10 rounded
                cursor-pointer select-none" onClick$={() => menu.value = !menu.value}>
                <LuAlignLeft class="h-4 w-4"/>
            </div>
            <p>
                {
                    head.title
                }
            </p>
        </div>
        <div class={["w-full h-full flex-col sm:justify-between items-center gap-2 sm:gap-1",
            "p-5 border-r text-xl sm:text-sm sm:flex text-center sm:text-left",
            menu.value ? "flex relative top-0 left-0 w-full" : "hidden"]}>
            <div class="flex flex-col gap-2 sm:gap-1 w-full">
                <NavItem active={loc.url.pathname == '/dash/'} 
                    href="/dash/">
                    <LuSquareSlash class="w-5 h-5 sm:w-4 sm:h-4" />
                    Accueil
                </NavItem>
                <NavItem active={loc.url.pathname == '/dash/membres/'} 
                    href="/dash/membres">
                    <LuUsers class="w-5 h-5 sm:w-4 sm:h-4" />
                    Membres
                </NavItem>
                <NavItem active={loc.url.pathname == '/dash/poles/'}
                    href="/dash/poles/">
                    <LuTags class="w-5 h-5 sm:w-4 sm:h-4" />
                    Pôles
                </NavItem>
                <NavItem active={loc.url.pathname == '/dash/planning/'}
                    href="/dash/planning/">
                    <LuCalendarDays class="w-5 h-5 sm:w-4 sm:h-4" />
                    Planning
                </NavItem>
                <NavItem active={loc.url.pathname == '/dash/notifications/'}
                    href="/dash/notifications/">
                    <LuMessageSquare class="w-5 h-5 sm:w-4 sm:h-4"/>
                    Notifications
                </NavItem>
            </div>
            <div class="flex flex-col gap-2 sm:gap-1 w-full">
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