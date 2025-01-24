import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";

export default component$(() => {
    return (
        <>
            <h1>Hello, World!</h1>
        </>
    );
});

export const head: DocumentHead = {
    title: "Tidee - Connexion",
    meta: [
        {
            name: "description",
            content: "Une solution de gestion d'association",
        },
    ],
};
