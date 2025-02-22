import { component$ } from "@builder.io/qwik";

export default component$(() => {
    return <section class="p-5 flex flex-col gap-4">
        <h1 class="text-2xl">
            Pôles
        </h1>

        <ol class="list-inside list-decimal px-2">
            <li>Vérifier les permissions</li>
            <li>Liste tous les pôles</li>
            <li>Possibilité d'ajouter ou retirer un responsable sur chaque pôle</li>
            <li>gérer les permissions du pôle</li>
        </ol>
    </section>
})