import { component$, type Signal, createContextId, noSerialize, Slot, useContextProvider, useSignal, useVisibleTask$, useTask$, useStore } from "@builder.io/qwik";
import { useLocation, useNavigate } from "@builder.io/qwik-city";

import Notifications, { type Notification } from "~/components/utils/Notifications";
import db, { type Connection } from "~/lib/db";
import type { RecordId } from "surrealdb";

// On permet aux membres enfants d'utiliser ces signaux / stores
// ça permet d'avoir un état syncroniser dans toute l'application
/////////////////////

// L'interface avec la base de données
export const connectionCtx = createContextId<Signal<Connection>>('connection') 

// Permet d'ajouter des notifications
export const notificationsCtx = createContextId<Notification[]>('notifications')

// Permet d'accéder aux permissions de l'utilisateur.
// Pas de panique! Même si l'utilisateur parvient à changer les permissions côté client, 
// les actions non-autorisées seront refusées par la base de données.
export const permissionsCtx = createContextId<string[]>('permissions');

export default component$(() => {
    const loc = useLocation()
    const nav = useNavigate()
    const database = useSignal<Connection>();
    const permissionsStore = useStore<string[]>([])

    const notifs_count = useSignal(0)
    const notifs = useStore<Notification[]>([]);

    useContextProvider(connectionCtx, database);
    useContextProvider(notificationsCtx, notifs);
    useContextProvider(permissionsCtx, permissionsStore);

    useTask$(({ track }) => {
        // On execute cette fonction à chaque fois 
        // qu'on ajoute ou retire une notification
        track(notifs);

        if(notifs_count.value == notifs.length) return
        else if(notifs_count.value > notifs.length) {
            notifs_count.value = notifs.length
        } else if(notifs.length > 0) {
            // On initialise une notification
            for(let i = 0; i < (notifs.length - notifs_count.value); i++) {
                const id = Math.floor(Math.random() * 999999)
                notifs.at(-i - 1)!.id = id
                setTimeout(() => {
                    const j = notifs.findIndex(notif => notif.id === id);
                    notifs.splice(j, 1);
                    notifs_count.value = notifs.length
                }, 1000 * notifs.at(-i - 1)!.duration)
            }
        }
    })

    useVisibleTask$(async () => {
        // On essaye de connecter le client pour pas qu'il n'est à se connecter manuellement.
        try {
            const connection = await db();
            // Impossible de serialiser la class Surreal
            database.value = noSerialize(connection);

            console.info("Connexion avec la base de données établit")
            
            // Le jeton qui sert à l'utilisateur de s'authentifier
            const token = localStorage.getItem('token');
            if(!token && loc.url.pathname.startsWith('/dash')) {
                nav('/') // On veut pas qu'un utilisant sans jeton se trouve dans une partie restreinte
                return;
            } else if(!token) return;
            
            // On authentifie un client avec jeton
            await database.value!.authenticate(token);

            // Chargement des permissions de l'utilisateur
            // $session.rd fait référence à l'id de l'utilisateur (rd: RecordId)
            permissionsStore.splice(0, permissionsStore.length)
            const perms = await database.value!.query<[RecordId[]]>("fn::permissions($session.rd)");
            permissionsStore.push(...perms[0].map(perm => perm.id.toString()))

            console.info("Authentifié avec succès")
        } catch {
            console.error("Authentification échoué")
            if(database.value && database.value.connection?.connection.token) {
                database.value.connection.connection.token = undefined
            }
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
