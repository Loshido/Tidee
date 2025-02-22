import { component$ } from "@builder.io/qwik";

export default component$(() => {
    return <section class="p-5 flex flex-col gap-4">
        <h1 class="text-2xl">
            Logs
        </h1>

        <ol class="list-inside list-decimal px-2">
            <li>Vérifier les permissions</li>
            <li>Lister les différentes catégories de Logs</li>
            <li>Lister les différentes catégories de Logs</li>
            <li>Afficher les logs</li>
        </ol>
    </section>
})