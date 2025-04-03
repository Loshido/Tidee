import { $, component$, createContextId, useContext, useContextProvider, useStore, useVisibleTask$ } from "@builder.io/qwik";
import { useNavigate } from "@builder.io/qwik-city";
import { until } from "~/components/membres/utils";
import { connectionCtx, notificationsCtx, permissionsCtx } from "~/routes/layout";
import type { RequetePoles, SerializablePoles } from "./types";
import Pole from "./pole";
import { LuPlus } from "@qwikest/icons/lucide";
import { RecordId } from "surrealdb";

export const polesCtx = createContextId<SerializablePoles[]>('poles-edition');

export default component$(() => {
    const nav = useNavigate();
    const notifications = useContext(notificationsCtx);
    const permissions = useContext(permissionsCtx);
    const conn = useContext(connectionCtx)

    const poles = useStore<SerializablePoles[]>([])
    useContextProvider(polesCtx, poles)

    // Initilisation.
    useVisibleTask$(async () => {
        // On attend que la connection avec la BDD soit établit.
        await until(() => permissions.length > 0 && !!conn.value, 1000, () => {
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
        let query = `UPDATE poles SET `
            + Object.keys(modification)
                // @ts-ignore
                .filter(mod => modification[mod] !== undefined)
                .map(mod => `${mod} = $${mod}`)
                .join(', ')
            + ` WHERE id = $id`

        const response = await conn.value?.query<[unknown[]]>(query, {
            nom: modification.nom,

            // We tell surreal that those are records
            permissions: modification.permissions?.map(perm => new RecordId('permissions', perm)),
            poles: modification.poles?.map(pole => new RecordId('poles', pole)),
            responsables: modification.responsables?.map(resp => new RecordId('membres', resp.id)),
            id: new RecordId('poles', id)
        })
        const succes = response !== undefined && response[0].length > 0;

        notifications.push({
            duration: 3,
            contenu: succes 
            ? "Modifications effectuées"
            : "Une erreur est parvenu"
        })

        return succes
    })

    const create = $(async (_: string, modification: Partial<Omit<SerializablePoles, 'id'>>) => {
        if(modification.nom === undefined) {
            notifications.push({
                duration: 3,
                contenu: "Vous devez nommer le pôle!"
            })
            return false;
        }

        console.log(
            `CREATE poles CONTENT {
                nom: $nom,
                responsables: $responsables,
                poles: $poles,
                permissions: $permissions,
                meta: {
                    boutons: [],
                    description: '',
                    images: [],
                    style: ''
                }
            }`,
            {
                nom: modification.nom,
                responsables: modification.responsables?.map(resp => new RecordId('membres', resp.id)) || [],
                poles: modification.poles?.map(pole => new RecordId('poles', pole)) || [],
                permissions: modification.permissions?.map(perm => new RecordId('permissions', perm)) || []
            }
        )
        const response = await conn.value?.query<[unknown[]]>(
            `CREATE poles CONTENT {
                nom: $nom,
                responsables: $responsables,
                poles: $poles,
                permissions: $permissions,
                meta: {
                    boutons: [],
                    description: '',
                    images: [],
                    style: ''
                }
            }`,
            {
                nom: modification.nom,
                responsables: modification.responsables?.map(resp => new RecordId('membres', resp.id)) || [],
                poles: modification.poles?.map(pole => new RecordId('poles', pole)) || [],
                permissions: modification.permissions?.map(perm => new RecordId('permissions', perm)) || []
            }
        );

        const succes = response !== undefined && response[0].length > 0

        notifications.push({
            duration: 3,
            contenu: succes
                ? 'Pôle créé'
                : 'Une erreur est parvenu'
        })
        return succes
    })

    return <section class="flex flex-col text-xl font-medium has-[.active]:text-black/25 has-[.active]:text-sm">
        {
            poles.map(pole => <Pole
                key={pole.id}
                pole={pole}
                save={save}/>)
        }
        <Pole
            pole={{
                id: "unknown",
                nom: "",
                responsables: [],
                poles: [],
                permissions: []
            }}
            save={create}>
                <LuPlus/>
                Créer un pôle
        </Pole>
    </section>
})