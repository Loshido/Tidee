import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";

export default component$(() => {
    return <>
        Appels

        1 appel par pole.
        le membre doit être responsable
        
    </>
})

export const head: DocumentHead = {
    title: "Tidee - Appels"
};