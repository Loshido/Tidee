import { $, component$, useContext, useStore, type QRL } from "@builder.io/qwik";
import { LuArrowDownToLine, LuShield, LuTags } from "@qwikest/icons/lucide";
import Entree from "~/components/admin/entree";
import Select from "~/components/admin/select";
import type { Utilisateur } from "./types";
import { notificationsCtx } from "~/routes/layout";

type Props = {
    permissions: string[],
    poles: string[],
    actions: {
        create: QRL<(modifications: Omit<Utilisateur, 'id'>) => Promise<boolean>>,
        suppression: QRL<() => Promise<void>>
    }
}

export default component$(({ permissions, poles, actions }: Props) => {
    const notifications = useContext(notificationsCtx)
    const modifications = useStore<Omit<Utilisateur, 'id'>>({
        nom: '',
        prenom: '',
        heures: 0,
        email: '',
        promotion: '',
        permissions: [],
        poles: [],
    })

    return <section class="p-5 flex flex-col gap-2">
        <div class="flex flex-row flex-wrap gap-2">
            <Entree
                name="Adresse mail"
                type="text"
                required={true}
                onInput$={(_, t) => modifications.email = t.value}/>
            <Entree
                name="Nom"
                type="text"
                required={true}
                onInput$={(_, t) => modifications.nom = t.value}/>
            <Entree
                name="Prénom"
                type="text"
                required={true}
                onInput$={(_, t) => modifications.prenom = t.value}/>
            <Entree
                name="Promotion"
                type="text" class="w-28"
                required={true}
                onInput$={(_, t) => modifications.promotion = t.value}/>
            <Entree
                name="Heures"
                required={true}
                type="number" class="w-24"
                onInput$={(_, t) => modifications.heures = parseInt(t.value) || modifications.heures}/>
        </div>
        <div class="flex flex-row flex-wrap gap-2">
            <Select
                items={permissions.map(permission => ({
                    active: modifications.permissions.includes(permission),
                    onClick: $(() => {
                        const i = modifications.permissions.indexOf(permission);
                        if(i !== -1) {
                            modifications.permissions.splice(i, 1);
                        } else {
                            modifications.permissions.push(permission)
                        }
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
                    active: modifications.poles.includes(pole),
                    onClick: $(() => {
                        const i = modifications.poles.indexOf(pole);
                        if(i !== -1) {
                            modifications.poles.splice(i, 1);
                        } else {
                            modifications.poles.push(pole)
                        }
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
                if(
                    modifications.email.length == 0 ||
                    modifications.nom.length == 0 ||
                    modifications.prenom.length == 0 ||
                    modifications.promotion.length == 0
                ) {
                    notifications.push({
                        contenu: "🤬 Vous avez pas rempli correctement les entrées!",
                        duration: 3
                    })
                    return;
                }

                const success = await actions.create(modifications)
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
                Envoyer
            </div>
        </div>
    </section>
})