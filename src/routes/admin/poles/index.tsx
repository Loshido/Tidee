import { $, component$, useContext, useStore, useVisibleTask$ } from "@builder.io/qwik";
import { useNavigate } from "@builder.io/qwik-city";
import { until } from "~/components/membres/utils";
import { connectionCtx, notificationsCtx, permissionsCtx } from "~/routes/layout";
import { RequetePoles, SerializablePoles } from "./types";
import Pole from "./pole";
import { LuPlus } from "@qwikest/icons/lucide";

export default component$(() => {
    const nav = useNavigate();
    const notifications = useContext(notificationsCtx);
    const permissions = useContext(permissionsCtx);
    const conn = useContext(connectionCtx)

    const poles = useStore<SerializablePoles[]>([])

    // Initilisation.
    useVisibleTask$(async () => {
        // On attend que la connection avec la BDD soit établit.
        await until(() => permissions.length > 0 && !!conn.value, 25, 1000, () => {
            nav('/admin/')
        })

        // Pour avoir accès à cette page vous devez avoir les permissions "gerer_membres"
        if(!permissions.includes('modifier_poles')) {
            nav('/admin/')
        }

        const response = await conn.value!.query<[RequetePoles[]]>(`
            SELECT 
                id, nom, permissions, poles, 
                array::map(responsables, |$r| {
                    { id: $r, nom: $r.nom, prenom: $r.prenom }
                }) AS responsables 
            FROM poles
        `);

        if(response[0].length === 0) {
            notifications.push({
                duration: 3,
                contenu: "Les pôles n'ont pas pu être chargé"
            })
            return;
        }

        console.log(response[0])
        response[0].forEach(pole => poles.push({
            ...pole,
            id: pole.id.id.toString(),
            permissions: pole.permissions.map(perm => perm.id.toString()),
            responsables: pole.responsables.map(resp => ({
                ...resp,
                id: resp.id.id.toString()
            })),
            poles: pole.poles.map(p => p.id.toString())
        }))
    })

    const save = $(async (id: string, modification: Partial<Omit<SerializablePoles, 'id'>>) => {
        return
    })

    return <section class="flex flex-col text-xl font-medium">
        {
            poles.map(pole => <Pole
                key={pole.id}
                pole={pole}
                save={save}/>)
        }
        <div class="flex flex-row gap-2 items-center cursor-pointer select-none 
            px-4 py-3 hover:bg-black/10 transition-colors">
            <LuPlus/>
            Créer un pôle
        </div>
    </section>
})