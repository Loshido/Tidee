import { component$ } from "@builder.io/qwik";
import NavItem, { liens_admin } from "./liens";
import { useLocation } from "@builder.io/qwik-city";

type Props = {
    open: boolean,
    permissions: string[]
}

export default component$(({ open, permissions }: Props) => {
    const loc = useLocation()

    return <div class={["w-full h-full flex-col sm:justify-between items-center gap-2 sm:gap-1",
        "p-5 border-r text-xl sm:text-sm sm:flex text-center sm:text-left bg-white",
        open ? "flex relative top-0 left-0 w-full" : "hidden"]}>
        <div class="flex flex-col gap-2 sm:gap-1 w-full">
            {
                liens_admin.navigation.map(lien => {
                    if(lien.permissions && typeof lien.permissions == 'function' 
                        && lien.permissions(permissions) === false) {
                        return null
                    } else if(lien.permissions && typeof lien.permissions == 'object' &&
                        !lien.permissions.every(permission => permissions.includes(permission))) {
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
                liens_admin.other.map(lien => {
                    if(lien.permissions && typeof lien.permissions == 'function' 
                        && lien.permissions(permissions) === false) {
                        return null
                    } else if(lien.permissions && typeof lien.permissions == 'object' &&
                        !lien.permissions.every(permission => permissions.includes(permission))) {
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
    </div>
})