import { component$ } from "@builder.io/qwik";
import { routeLoader$, type DocumentHead } from "@builder.io/qwik-city";
import { createCache } from "qwache";
import type { RecordId } from "surrealdb";
import db from "~/lib/db";

import Pole, { type PoleProps } from "~/components/poles/Pole";

const cache = createCache();

const QUERY = `SELECT 
    id,
    nom, 
    meta.boutons as boutons, 
    string::html::sanitize(meta.description) as description, 
    meta.style as style, 
    meta.images as images,
    fn::stat_par_pole(id) AS membres
FROM poles;`;

export const usePoles = routeLoader$(async (requestEvent) => {
    // This happens server-side
    
    // using 24h cache
    return await cache('poles', async () => {
        const client = await db();

        // authentification
        const USER = requestEvent.env.get('TIDE_USER');
        const PASS = requestEvent.env.get('TIDE_PASS');
        if(!USER || !PASS) {
            console.error('⚠️ You didn\'t set env variables TIDE_USER & TIDE_PASS');
            return []
        }

        await client.signin({
            namespace: 'tidee',
            database: 'data',
            username: USER,
            password: PASS
        })

        // Data fetching
        const poles = await client.query<[(PoleProps & { id: RecordId })[]]>(QUERY)

        return poles[0].map(pole => ({
            ...pole,
            id: pole.id.id.toString()
        }))
    }, 1000 * 60 * 60 * 24)
})

export default component$(() => {

    const poles = usePoles();

    return <section class="h-screen w-full overflow-x-auto snap-x snap-mandatory flex flex-row">
        {
            poles.value.map(pole => <Pole
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