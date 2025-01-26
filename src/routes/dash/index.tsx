import { component$ } from "@builder.io/qwik";

export default component$(() => {
    return <div class="p-5">
        /
        <ul class="list-inside list-disc ml-2">
            <li>
                Nombre de membres
            </li>
            <li>
                Nombre de membres par pôle
            </li>
            <li>
                Nombre de d'heures en moyenne (graphiques)
            </li>
            <li>
                Accès paramètres administrateurs pour le bureau
            </li>
            <li>
                Un graphique (comme les commits sur github) 
                qui montre qui a eu des heures sur le semaine.
            </li>
            <li>
                Informations sur l'utilisateur
            </li>
        </ul>
    </div>
})