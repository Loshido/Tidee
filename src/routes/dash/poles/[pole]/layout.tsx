import { component$, Slot, useContext, useVisibleTask$ } from "@builder.io/qwik";
import { useLocation, useNavigate } from "@builder.io/qwik-city";
import { until } from "~/components/membres/utils";
import { permissionsCtx } from "~/routes/layout";

export default component$(() => {
    const permissions = useContext(permissionsCtx);
    const loc = useLocation()
    const nav = useNavigate()

    useVisibleTask$(async () => {
        setTimeout(() => {
            if(permissions.length === 0) {
                nav('/dash/poles')
            }
        }, 1000 * 5);

        await until(() => permissions.length !== 0)
        if(!permissions.includes('modifier_pole_' + loc.params.pole.toLowerCase())) {
            nav('/dash/poles')
        }
    })

    return <Slot/>
})