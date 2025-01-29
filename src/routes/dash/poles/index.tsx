import { component$ } from "@builder.io/qwik";

export default component$(() => {
    return <div class="p-5">
        /poles
        <ul class="list-inside list-disc ml-2">
            <li>
                Fiche de présentation du pôle avec données résumées
            </li>
            <li>
                Les responsables du pôle
            </li>
            <li>
                Projets en cours
            </li>
        </ul>
    </div>
})