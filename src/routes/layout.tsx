import { component$, type Signal, createContextId, noSerialize, Slot, useContextProvider, useSignal, useVisibleTask$, useTask$, isBrowser, useStore } from "@builder.io/qwik";
import { useLocation, useNavigate } from "@builder.io/qwik-city";
import db, { type Connection } from "~/lib/db";

import Notifications, { type Notification } from "~/components/utils/Notifications";
export const connectionCtx = createContextId<Signal<Connection>>('connection')
export const notificationsCtx = createContextId<Notification[]>('notifications')

export default component$(() => {
    const loc = useLocation()
    const nav = useNavigate()
    const database = useSignal<Connection>();

    const notifs_count = useSignal(0)
    const notifs = useStore<Notification[]>([]);

    useContextProvider(connectionCtx, database);
    useContextProvider(notificationsCtx, notifs);

    useTask$(({ track }) => {
        // On execute cette fonction à chaque fois 
        // qu'on ajoute ou retire une notification
        track(notifs);

        if(notifs_count.value == notifs.length) return
        else if(notifs_count.value > notifs.length) {
            notifs_count.value = notifs.length
        } else if(notifs.length > 0) {
            // On initialise une notification

            const id = Math.floor(Math.random() * 999999)
            notifs.at(-1)!.id = id
            setTimeout(() => {
                const i = notifs.findIndex(notif => notif.id === id);
                notifs.splice(i, 1);
                notifs_count.value = notifs.length
            }, 1000 * notifs.at(-1)!.duration)
        }
    })

    useVisibleTask$(async () => {
        try {
            const connection = await db();
            database.value = noSerialize(connection);
    
            console.info(`Connection attempt to the database: ${database.value!.status}`)
    
            const token = localStorage.getItem('token');
            if(!token && loc.url.pathname.startsWith('/dash')) {
                nav('/')
                return;
            } else if(!token) return;

            await database.value?.authenticate(token);
            console.info('Client authentificated')
        } catch {
            if(loc.url.pathname.startsWith('/dash')) {
                nav('/')
            }
        }
    })

    return <>
        <Notifications notifications={notifs}/>
        <Slot />
    </>;
});
