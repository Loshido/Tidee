import { component$ } from "@builder.io/qwik";

export default component$(() => {
    return <div class="p-5">
        /notifications
        <ul class="list-inside list-disc ml-2">
            <li>
                ajouter des notifications sur l'accueil de Tidees
            </li>
            <li>
                retirer des notifications
            </li>
            <li>
                programmer l'expiration des notifications
            </li>
            <li>
                push notifications
            </li>
        </ul>
    </div>
})