import { component$, type PropsOf, type QRL, Slot, useContext, useStore } from "@builder.io/qwik";
import { type SerializableMembre } from "./utils";
import { Link } from "@builder.io/qwik-city";

interface EditionProps {
    membre?: SerializableMembre,
    poles: string[]
    exit: QRL,
    update: QRL<(membre: Partial<SerializableMembre>) => Promise<boolean>>
}

export const TR = component$(() => <tr class="group select-none">
    <Slot/>
</tr>)
export const TH = component$(() => <th class="px-4 py-3 border-r">
    <Slot/>
</th>)
export const TD = component$((props: PropsOf<'td'>) => <td 
    {...props} 
    class="px-4 py-3 group-hover:bg-[var(--bg-main-20)] transition-colors relative">
    <Slot/>
</td>)
import { Dropdown, Option } from "./Filtres";
import { notificationsCtx } from "~/routes/layout";

export default component$(({ membre, exit, poles, update }: EditionProps) => {
    const notifications = useContext(notificationsCtx)
    const edition = useStore<Partial<SerializableMembre> & { active: boolean, dropdown: boolean }>({
        active: false,
        dropdown: false
    })
    
    if(!membre) return <></>
    return <section id="edition" class="fixed top-0 left-0 w-full h-screen backdrop-blur-sm z-50" 
        onClick$={(e, t) => e.target === t ? exit() : null }>
        <div class="h-full w-full sm:w-fit bg-white ml-auto p-5 border-l backdrop-blur-3xl
            flex flex-col gap-1">
            <Link onClick$={exit}
                class="sm:hidden text-sm cursor-pointer select-none h-fit rounded-sm
                    hover:text-black hover:text-opacity-25 transition-colors my-2
                    px-4 py-2">
                Revenir en arrière
            </Link>

            <table class="w-full rounded-sm">
                <TR>
                    <TH>
                        Nom
                    </TH>
                    <TD contentEditable={edition.active ? 'true' : 'false'}
                        onInput$={(_, t) => edition.nom = t.innerText}>
                        {membre.nom}
                    </TD>
                </TR>
                <TR>
                    <TH>
                        Prénom
                    </TH>
                    <TD contentEditable={edition.active ? 'true' : 'false'}
                        onInput$={(_, t) => edition.prenom = t.innerText}>
                        {membre.prenom}
                    </TD>
                </TR>
                <TR>
                    <TH>
                        Email
                    </TH>
                    <TD contentEditable={edition.active ? 'true' : 'false'}
                        onInput$={(_, t) => edition.email = t.innerText}>
                        {membre.email}
                    </TD>
                </TR>
                <TR>
                    <TH>
                        Heures
                    </TH>
                    <TD contentEditable={edition.active ? 'true' : 'false'}
                        onInput$={(_, t) => {
                            const h = parseInt(t.innerText)
                            if(Number.isNaN(h)) return
                            edition.heures = h
                        }}>
                        {membre.heures}
                    </TD>
                </TR>
                <TR>
                    <TH>
                        Promotion
                    </TH>
                    <TD contentEditable={edition.active ? 'true' : 'false'}
                        onInput$={(_, t) => edition.promotion = t.innerText}>
                        {membre.promotion}
                    </TD>
                </TR>
                <TR>
                    <TH>
                        Poles
                    </TH>
                    <TD document:onClick$={(e, t) => {
                        const target = e.target as HTMLElement | null;
                        if(target && target.contains(t) && edition.active && !edition.dropdown) {
                            edition.dropdown = true;
                        } else if(edition.active && edition.dropdown) {
                            edition.dropdown = false;
                        } 
                    }}>
                        <span>
                            {
                                edition.poles 
                                ? edition.poles.join(', ')
                                : membre.poles.join(', ')
                            }
                        </span>
                        <Dropdown class={edition.dropdown ? '*:select-none' : 'hidden'}>
                        {
                            poles.map(pole => <Option 
                                key={pole}
                                class={
                                    edition.poles && edition.poles.includes(pole) ||
                                    !edition.poles && membre.poles.includes(pole) 
                                    ? 'bg-black bg-opacity-15 cursor-pointer' 
                                    : 'cursor-pointer'}
                                onClick$={() => {
                                    if(!edition.poles) {
                                        edition.poles = membre.poles;
                                    }

                                    if (edition.poles.includes(pole)) {
                                        edition.poles = edition.poles
                                            .filter(p => p !== pole)
                                    } else {
                                        edition.poles.push(pole)
                                    }
                                }}>
                                {
                                    pole
                                }
                            </Option>)
                        }
                        </Dropdown>
                    </TD>
                </TR>
            </table>

            {
                edition.active
                ? <div class="grid grid-cols-3 gap-2 my-2 *:text-sm *:cursor-pointer *:select-none">
                    <div class="px-4 py-2 col-span-1 rounded-sm transition-colors
                        bg-gray-200 bg-opacity-50 hover:bg-opacity-100"
                        onClick$={() => {
                            edition.active = false,
                            edition.dropdown = false,

                            edition.email = undefined
                            edition.prenom = undefined
                            edition.nom = undefined
                            edition.poles = undefined
                            edition.heures = undefined
                            edition.promotion = undefined
                        }}>
                        Annuler
                    </div>
                    <div class="px-4 py-2 col-span-2 transition-colors rounded-sm
                        bg-green-500 bg-opacity-20 hover:bg-opacity-30"
                        onClick$={async () => {
                            
                            const response = await update({
                                id: membre.id,
                                nom: edition.nom,
                                prenom: edition.prenom,
                                email: edition.email,
                                heures: edition.heures,
                                promotion: edition.promotion,
                                poles: edition.poles
                            })
                            if(response) {
                                edition.active = false
                                edition.dropdown = false;
                                exit()
                                notifications.push({
                                    contenu: "✅ Membre mis à jour.",
                                    duration: 4
                                })
                            } else {
                                notifications.push({
                                    contenu: "🕵️ Une erreur est parvenue.",
                                    duration: 4
                                })
                            }
                        }}>
                        Sauvegarder
                    </div>
                </div>
                : <div class="text-sm cursor-pointer select-none h-fit rounded-sm
                    hover:text-black hover:text-opacity-25 transition-colors my-2
                    px-4 py-2"
                    onClick$={() => edition.active = true}>
                    Modifier
                </div>
            }
            
        </div>
    </section>
})