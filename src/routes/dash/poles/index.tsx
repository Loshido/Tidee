import { component$, useContext, useStore, useVisibleTask$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import type { RecordId } from "surrealdb";
import { until } from "~/components/membres/utils";

import Pole, { type PoleProps } from "~/components/poles/Pole";
import cache from "~/lib/cache";
import { configCtx, connectionCtx } from "~/routes/layout";

export const QUERY = `SELECT 
    id,
    nom, 
    meta.boutons as boutons, 
    string::html::sanitize(meta.description) as description, 
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
    const config = useContext(configCtx)

    const poles = useStore<PoleProps[]>([])

    useVisibleTask$(async () => {
        await until(() => !!conn.value);

        const data = await cache('poles', async () => {
            const response = await conn.value!.query<[(PoleProps & { id: RecordId })[]]>(QUERY);

            return response[0].map(pole => ({
                ...pole,
                id: pole.id.id.toString()
            }))
        }, config.cacheExpiration?.poles || 60 * 4 * 1000)

        poles.push(...data);
    })

    return <section id="poles-explorer" class="h-full w-full overflow-x-auto snap-x snap-mandatory flex flex-row">
        {
            poles.map(pole => <Pole
                key={pole.nom} 
                id={pole.id}
                nom={pole.nom}
                description={pole.description}
                boutons={pole.boutons}
                style={pole.style}
                images={pole.images}
                membres={pole.membres}/>)
        }
    </section>
})

export const head: DocumentHead = {
    title: "Tidee - Pôles"
};