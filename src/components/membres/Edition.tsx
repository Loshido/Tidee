import { component$, PropsOf, QRL, Slot, useStore } from "@builder.io/qwik";
import { type SerializableMembre } from "./utils";
import { Link } from "@builder.io/qwik-city";

interface EditionProps {
    membre?: SerializableMembre,
    exit: QRL
}

export const TR = component$(() => <tr class="group">
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

export default component$(({ membre, exit }: EditionProps) => {
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
                    <TD onClick$={(e, t) => {
                        if(edition.active && e.target == t) {
                            edition.dropdown = !edition.dropdown
                        }
                    }}>
                        {edition.poles ? edition.poles : membre.poles}
                        <Dropdown class={edition.dropdown ? '*:select-none' : 'hidden'}>
                        {
                            ['aa', 'bb', 'cc'].map(pole => <Option 
                                key={pole}
                                class={false ? 'bg-black bg-opacity-15 cursor-pointer' : 'cursor-pointer'}
                                onClick$={() => {
                                    
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
                        onClick$={() => edition.active = false}>
                        Annuler
                    </div>
                    <div class="px-4 py-2 col-span-2 transition-colors rounded-sm
                        bg-green-500 bg-opacity-20 hover:bg-opacity-30"
                        onClick$={() => edition.active = false}>
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