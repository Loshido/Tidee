import { component$ } from "@builder.io/qwik";

export default component$(() => {
    return <section class="p-5 flex flex-col gap-4">
        <h1 class="text-2xl">
            Paramètres
        </h1>

        <ol class="list-inside list-decimal px-2">
            <li>Vérifier les permissions</li>
            <li>Permettre de gérer la durée du cache de chaque requête</li>
            <li>Gérer les couleurs primaire de l'application</li>
            <li>Possibilité modifier le css de l'application</li>
        </ol>
    </section>
})