import { component$, useContext, useStore, useVisibleTask$ } from "@builder.io/qwik";
import { until } from "~/components/membres/utils";
import { connectionCtx, permissionsCtx } from "~/routes/layout";

export default component$(() => {
    const data = useStore<string[]>([])
    const conn = useContext(connectionCtx)
    const permissions = useContext(permissionsCtx)

    useVisibleTask$(async () => {
        await until(() => !!conn.value);
        console.time('fetching debug data')
        
        data.push('// permissions\n' + JSON.stringify(permissions, undefined, 4))
        
        const session = await conn.value!.query('$session;')
        data.push('// $session\n' + JSON.stringify(session[0], undefined, 4));
        console.timeEnd('fetching debug data')
    })

    return <section class="p-5 flex flex-col sm:flex-row flex-wrap gap-2 text-xs">
        {
            data.map((d, i) => <pre class="p-3 border h-fit w-fit" key={i}>
                {
                    d
                }
            </pre>)
        }
    </section>
})