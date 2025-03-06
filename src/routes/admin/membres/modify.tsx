import { $, component$, useStore, type QRL } from "@builder.io/qwik";
import { LuArrowDownToLine, LuShield, LuTags } from "@qwikest/icons/lucide";
import Entree from "~/components/admin/entree";
import Select from "~/components/admin/select";
import Suppression from "./suppression";
import type { Utilisateur } from "./types";

type Props = {
    utilisateur: Utilisateur,
    permissions: string[],
    poles: string[],
    actions: {
        send: QRL<(modifications: Partial<Utilisateur>) => Promise<boolean>>,
        suppression: QRL<() => Promise<void>>
    }
}

export default component$(({ utilisateur, permissions, poles, actions }: Props) => {
    const modifications = useStore<Partial<Utilisateur>>({})

    return <section class="p-5 flex flex-col gap-2">
        <div class="flex flex-row flex-wrap gap-2">
            <Entree
                name="Adresse mail"
                type="text"
                onInput$={(_, t) => modifications.email = t.value}
                value={utilisateur.email}/>
            <Entree
                name="Nom"
                type="text"
                onInput$={(_, t) => modifications.nom = t.value}
                value={utilisateur.nom}/>
            <Entree
                name="Prénom"
                type="text"
                onInput$={(_, t) => modifications.prenom = t.value}
                value={utilisateur.prenom}/>
            <Entree
                name="Promotion"
                type="text" class="w-28"
                onInput$={(_, t) => modifications.promotion = t.value}
                value={utilisateur.promotion}/>
            <Entree
                name="Heures"
                type="number" class="w-24"
                onInput$={(_, t) => modifications.heures = parseInt(t.value) || undefined}
                value={utilisateur.heures}/>
        </div>
        <div class="flex flex-row flex-wrap gap-2">
            <Select
                items={permissions.map(permission => ({
                    active: utilisateur.permissions.includes(permission),
                    onClick: $(() => {
                        const i = utilisateur.permissions.indexOf(permission);
                        if(i !== -1) {
                            utilisateur.permissions.splice(i, 1);
                        } else {
                            utilisateur.permissions.push(permission)
                        }
                        // On réplique pour que les modifications soient prises en compte.
                        modifications.permissions = utilisateur.permissions
                    }),
                    slot: <>
                        {permission}
                    </>
                }))}>
                <LuShield/>
                Permissions
            </Select>
            <Select
                items={poles.map(pole => ({
                    active: utilisateur.poles.includes(pole),
                    onClick: $(() => {
                        const i = utilisateur.poles.indexOf(pole);
                        if(i !== -1) {
                            utilisateur.poles.splice(i, 1);
                        } else {
                            utilisateur.poles.push(pole)
                        }
                        
                        modifications.poles = utilisateur.poles
                    }),
                    slot: <>
                        {pole}
                    </>
                }))}>
                <LuTags/>
                Pôles
            </Select>
        </div>
        <div class="flex flex-row flex-wrap gap-2">
            <div onClick$={async () => {
                const success = await actions.send(modifications)
                if(success) {
                    Object.keys(modifications).forEach(key => {
                        // @ts-ignore
                        delete modifications[key]
                    })
                }
            }}
                class="px-2 py-1 border rounded flex flex-row gap-2 items-center 
                 hover:bg-blue-400 hover:bg-opacity-5 transition-colors cursor-pointer select-none">
                <LuArrowDownToLine class="w-4 h-4"/>
                Enregistrer
            </div>
            <Suppression
                name={utilisateur.prenom}
                delete={actions.suppression}/>
        </div>
    </section>
})