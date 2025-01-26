import { component$ } from "@builder.io/qwik";

export default component$(() => {
    return <div class="p-5">
        /membres
        <ul class="list-inside list-disc ml-2">
            <li>
                Filtres par pôle, heures, Nom, Prénom, Email...
            </li>
            <li>
                Trier par pôle, heures, nom, prénom...
            </li>
            <li>
                Possibilité aux responsables de modifier les entrées
            </li>
        </ul>
    </div>
})