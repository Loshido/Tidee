import { component$, useContext, useVisibleTask$ } from "@builder.io/qwik";
import { connectionCtx } from "../layout";
import { useNavigate } from "@builder.io/qwik-city";

export default component$(() => {
    const conn = useContext(connectionCtx);
    const nav = useNavigate()

    // eslint-disable-next-line qwik/no-use-visible-task
    useVisibleTask$(async () => {
        if(conn.value && conn.value.connection) {
            conn.value.connection.connection.token = undefined;
        }
        localStorage.removeItem('token')
        localStorage.removeItem('email')
        nav('/', {
            forceReload: true
        })
    })

    return <>
        <span class="animate-pulse">
            Déconnexion...
        </span>
    </>
})