import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";

export default component$(() => {
    return <div class="p-5">
        /planning
        <ul class="list-inside list-disc ml-2">
            <li>
                planifier des evenements exportable sur google calendar...
            </li>
            <li>
                assigner un evenement à un pôle, un membre...
            </li>
            <li>
                planifier des saisons (ex: création d'un drone) pour les évènements sur plusieurs mois.
            </li>
            <li>
                Envoyer des notifications avant l'évènement
            </li>
            <li>
                Checklist sur l'évènement
            </li>
        </ul>
    </div>
})

export const head: DocumentHead = {
    title: "Tidee - Planning"
};