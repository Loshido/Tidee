import { component$, isDev, type JSXOutput, Slot } from "@builder.io/qwik";
import { Link, type LinkProps } from "@builder.io/qwik-city";

export default component$(({ active, ...props}: LinkProps & { active?: boolean }) => <Link {...props}
    class={["flex flex-row gap-2 items-center px-3 py-1.5",
        "hover:bg-black hover:bg-opacity-10 rounded",
        "cursor-pointer select-none transition-colors",
        active ? 'bg-black bg-opacity-10' : '']}>
    <Slot/>
</Link>)

type Lien = {
    path: string,
    slot: JSXOutput,
    permissions?: string[] | ((permissions: string[]) => boolean) // permissions requises pour aller à un page
}
import { LuBug, LuCalendarDays, LuClipboardCheck, 
    LuLogOut, LuMessageSquare, LuSatellite, LuSettings,
    LuSquareSlash, LuTags, LuUsers, LuFileClock, 
    LuFileCog, 
    LuTestTube2} from "@qwikest/icons/lucide"
export const liens_dash: {
    navigation: Lien[],
    other: Lien[]
} = {
    navigation: [
        {
            path: '/dash/',
            slot: <>
                <LuSquareSlash class="w-5 h-5 sm:w-4 sm:h-4" />
                Accueil
            </>,
        },
        {
            path: '/dash/membres/',
            slot: <>
                <LuUsers class="w-5 h-5 sm:w-4 sm:h-4" />
                Membres
            </>,
        },
        {
            path: '/dash/poles/',
            slot: <>
                <LuTags class="w-5 h-5 sm:w-4 sm:h-4" />
                Pôles
            </>,
        },
        {
            path: '/dash/planning/',
            slot: <>
                <LuCalendarDays class="w-5 h-5 sm:w-4 sm:h-4" />
                Planning
            </>,
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
            permissions: [
                'notifications'
            ]
        },
        {
            path: "/dash/appels/",
            slot: <>
                <LuClipboardCheck class="w-5 h-5 sm:w-4 sm:h-4"/>
                Appel
            </>,
            permissions: (p: string[]) => {
                // Si l'utilisateur est responsable d'un pôle
                return p.some(permission => 
                    permission.startsWith('modifier_pole_') 
                    || permission === 'modifier_poles')
            }
        }
    ],
    other: [
        {
            path: "/dash/debug/",
            slot: <>
                <LuBug class="w-5 h-5 sm:w-4 sm:h-4"/>
                Debug
            </>,
            permissions: () => isDev,
        },
        {
            path: "/admin/",
            slot: <>
                <LuSatellite class="w-5 h-5 sm:w-4 sm:h-4"/>
                Administration
            </>,
            permissions: ['administration']
        },
        {
            path: "/dash/parametres/",
            slot: <>
                <LuSettings class="w-5 h-5 sm:w-4 sm:h-4"/>
                Paramètres
            </>
        },
        {
            path: "/deconnexion/",
            slot: <>
                <LuLogOut class="w-5 h-5 sm:w-4 sm:h-4"/>
                Déconnexion
            </>
        }
    ]
}
export const liens_admin: {
    navigation: Lien[],
    other: Lien[]
} = {
    navigation: [
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
        },
        {
            path: '/admin/query/',
            slot: <>
                <LuTestTube2 class="w-5 h-5 sm:w-4 sm:h-4"/>
                Requêtes
            </>,
            permissions: ['requetes_libres']
        }
    ],
    other: [
        {
            path: "/dash/",
            slot: <>
                <LuSquareSlash class="w-5 h-5 sm:w-4 sm:h-4"/>
                Tableau de board
            </>
        }
    ]
}