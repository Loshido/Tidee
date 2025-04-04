import { component$, useContext, useStore, useVisibleTask$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { configCtx, connectionCtx } from "../layout";
import { until } from "~/components/membres/utils";

import WeekGraph, { type ActiviteHebdo, REQUETE_ACTIVITE_HEBDO, responseToWeekGraph, type WeekGraphProps } from "~/components/accueil/week-graph";
import Count from "~/components/accueil/user-count";
import Lien from "~/components/accueil/lien";

import Yanliu from "~/assets/yanliu.png?jsx"
import Blur from "~/assets/bg-blur.svg?jsx"
import { LuArrowUpRight } from "@qwikest/icons/lucide";
import cache from "~/lib/cache";

interface Data {
    membres: number,
    responsables: number,
    moyenne_heures: number,
    poles: number,
    graph?: WeekGraphProps
}
type Query = [ActiviteHebdo[], [{ count: number, moyenne: number }], [{ count: number }], [{ count: number }] ]

const REQUETE = REQUETE_ACTIVITE_HEBDO + `
SELECT count(id), math::mean(heures) AS moyenne FROM membres GROUP ALL;
SELECT count() 
FROM array::distinct(
    (
        SELECT array::flatten(responsables) AS responsables 
        FROM poles 
        GROUP ALL)[0].responsables
    ) GROUP ALL;

SELECT count(id) FROM poles GROUP ALL;`

export default component$(() => {
    const conn = useContext(connectionCtx)
    const config = useContext(configCtx)
    const data = useStore<Data>({
        membres: 0,
        responsables: 0,
        moyenne_heures: 0,
        poles: 0
    })

    useVisibleTask$(async () => {
        await until(() => !!conn.value)


        const responses = await cache('accueil', async () => {
            const resp = await conn.value!.query<Query>(REQUETE);

            const graph = responseToWeekGraph(resp[0]);
            return {
                membres: resp[1][0].count,
                moyenne_heures: Math.ceil(resp[1][0].moyenne),
                responsables: resp[2][0].count,
                poles: resp[3][0].count,
                graph
            }
        }, config.cacheExpiration?.accueil || 60 * 60 * 24 * 1000) 
        
        data.graph = responses.graph
        data.membres = responses.membres;
        data.moyenne_heures = responses.moyenne_heures;
        data.responsables = responses.responsables;
        data.poles = responses.poles;

    })

    return <div class="md:overflow-hidden p-5 h-auto md:h-screen w-full *:backdrop-blur-sm *:bg-white/25
        grid grid-cols-2 grid-rows-none sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 lg:grid-rows-8 gap-2">
        <Count class="md:col-span-2" compte={data.membres} legende="membres" />
        <Count class="md:col-span-2" compte={`${data.moyenne_heures}h`} legende="en moyenne par membre"/>
        <Count class="md:col-span-2" compte={data.responsables} legende="responsables" />
        <Count class="md:col-span-2" compte={data.poles} legende="pôles"/>
        <WeekGraph objectif={3} graph={data.graph} 
            class="col-span-2 sm:col-span-3 md:col-span-4 sm:row-span-3 md:row-span-2 lg:row-span-3 xl:row-span-2" />
        <div class="flex flex-wrap flex-row items-center content-start justify-stretch gap-2 col-span-2 !bg-transparent backdrop-blur-none">
            <Lien href="https://doc.isenengineering.fr" target="_blank">
                Doc
                <LuArrowUpRight/>
            </Lien>
            <Lien href="https://mail.isenengineering.fr" target="_blank">
                Mail
                <LuArrowUpRight/>
            </Lien>
            <Lien href="https://status.isenengineering.fr/status" target="_blank">
                Status
                <LuArrowUpRight/>
            </Lien>
            <Lien href="https://webmail.isenengineering.fr" target="_blank">
                Webmail
                <LuArrowUpRight/>
            </Lien>
        </div>
        <div class="md:col-span-2 lg:row-span-4 md:row-span-3 
            flex items-center justify-center w-full h-full object-cover p-5 border rounded">
            <Yanliu class="w-full h-full object-cover rounded-md"/>
        </div>
        <Blur class="-z-10 absolute bottom-0 right-0 w-screen h-screen object-contain" />
    </div>
})

export const head: DocumentHead = {
    title: "Tidee",
};