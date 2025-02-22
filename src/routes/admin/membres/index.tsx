import { component$ } from "@builder.io/qwik";

export default component$(() => {
    return <section class="p-5 flex flex-col gap-4">
        <h1 class="text-2xl">
            Membres
        </h1>

        <ol class="list-inside list-decimal px-2">
            <li>Vérifier les permissions</li>
            <li>Un champ permet de cherhcer un utilisateur spécifique</li>
            <li>On peut modifier tous les données relatifs à cette utilisateur</li>
            <li>possibilité de supprimer ou ajouter un utilisateur</li>
        </ol>
    </section>
})