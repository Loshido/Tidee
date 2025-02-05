import { component$, useContext, useSignal, useStore, useVisibleTask$ } from "@builder.io/qwik";
import { until } from "~/components/membres/utils";

import Pole, { type PoleProps } from "~/components/poles/Pole";
import { cache } from "~/lib/local";
import { connectionCtx } from "~/routes/layout";

const QUERY = `SELECT 
    nom, 
    meta.boutons as boutons, 
    meta.description as description, 
    meta.style as style, 
    meta.images as images,
    (
        SELECT COUNT(heures) AS nb, math::mean(heures) AS heures 
        FROM membres 
        WHERE $parent.id INSIDE poles
        GROUP ALL
    ) AS membres
FROM poles;`;

export default component$(() => {
    const conn = useContext(connectionCtx);
    const poles = useStore<PoleProps[]>([])

    useVisibleTask$(async () => {
        await until(() => !!conn.value);

        const data = await cache('poles', 60 * 4, async () => {
            const response = await conn.value!.query<[PoleProps[]]>(QUERY);

            return response[0]
        })

        poles.push(...data);
    })

    return <section class="h-full w-full overflow-x-auto snap-x snap-mandatory flex flex-row">
        {
            poles.map(pole => <Pole
                key={pole.nom} 
                nom={pole.nom}
                description={pole.description}
                boutons={pole.boutons}
                style={pole.style}
                images={pole.images}
                membres={pole.membres}/>)
        }
    </section>
})