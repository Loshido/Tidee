import { component$, useContext, useStore, useVisibleTask$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import WeekGraph, { ActiviteHebdo, REQUETE_ACTIVITE_HEBDO } from "~/components/accueil/week-graph";
import { connectionCtx } from "../layout";
import { until } from "~/components/membres/utils";

export default component$(() => {
    const conn = useContext(connectionCtx)
    const activites = useStore<ActiviteHebdo[]>([])

    useVisibleTask$(async () => {
        await until(() => !!conn.value)

        const [ acts ] = await conn.value!.query<[ActiviteHebdo[]]>(REQUETE_ACTIVITE_HEBDO);

        activites.push(...acts)
    })

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
        <WeekGraph objectif={3} activites={activites} />
    </div>
})

export const head: DocumentHead = {
    title: "Tidee",
};