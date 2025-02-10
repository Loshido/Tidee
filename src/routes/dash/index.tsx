import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import WeekGraph from "~/components/accueil/week-graph";

const semaines = [
    "Oct 21, 2024", "Oct 28, 2024",
    "Nov 4, 2024", "Nov 11, 2024", "Nov 18, 2024",
    "Nov 25, 2024", "Dec 2, 2024", "Dec 9, 2024",
    "Dec 16, 2024", "Dec 23, 2024", "Dec 30, 2024",
    "Jan 6, 2025", "Jan 13, 2025", "Jan 20, 2025",
    "Jan 27, 2025", "Feb 3, 2025"
]

const poles: { [key: string]: { activite: (number | null)[], couleur?: string} } = {
    dev: {
        activite: [],
        couleur: '#dc2626'
    },
    serveur: {
        activite: [],
        couleur: '#2563eb'
    },
    cyber: {
        activite: []
    },
    innovation: {
        activite: []
    }
};

for(let i = 0; i < semaines.length; i++) {
    if(Math.random() > 0.8) poles['dev'].activite.push(null)
    else poles['dev'].activite.push(Math.random())

    poles['serveur'].activite.push(Math.random())
    poles['cyber'].activite.push(Math.random())
    poles['innovation'].activite.push(Math.random())
}

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
        <WeekGraph poles={poles} dates={semaines} />
    </div>
})

export const head: DocumentHead = {
    title: "Tidee",
};