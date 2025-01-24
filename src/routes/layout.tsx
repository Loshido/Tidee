import { component$, type Signal, createContextId, noSerialize, Slot, useContextProvider, useSignal, useVisibleTask$, useTask$, isBrowser } from "@builder.io/qwik";
import { useNavigate } from "@builder.io/qwik-city";
import db, { type Connection } from "~/lib/db";

export const connectionCtx = createContextId<Signal<Connection>>('connection')

export default component$(() => {
    const nav = useNavigate()
    const database = useSignal<Connection>();
    useContextProvider(connectionCtx, database);

    useVisibleTask$(async () => {
        try {
            const connection = await db();
            database.value = noSerialize(connection);
    
            console.info(`Connection attempt to the database: ${database.value!.status}`)
    
            const token = localStorage.getItem('token');
            if(!token) return;
            await database.value?.authenticate(token);
            console.info('Client authentificated')
        } catch {
            // Aller sur une page qui explique que la base de données ne fonctionne pas
            // nav('/')
        }
    })

    return <Slot />;
});
