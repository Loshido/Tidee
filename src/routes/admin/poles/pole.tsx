import { $, component$, type JSXOutput, type PropsOf, type QRL, Slot, useContext, useSignal, useStore } from "@builder.io/qwik";
import type { SerializablePoles } from "./types"
import { connectionCtx, permissionsCtx } from "~/routes/layout";
import { polesCtx } from ".";
import type { RecordId } from "surrealdb";
import Lists from "~/components/admin/lists";
import { LuX } from "@qwikest/icons/lucide";

type Props = {
    pole: SerializablePoles,
    save: QRL<(id: string, modification: Partial<Omit<SerializablePoles, 'id'>>) => Promise<boolean>>
}

type Menu = null | 'permissions' | 'poles' | 'responsables'

export const Block = ({ children, ...props }: { children: JSXOutput } & PropsOf<'div'>) => <div 
    {...props}
    class={["border px-4 py-3 text-sm cursor-pointer select-none",
       "hover:bg-black/10 transition-colors",
       props.class && props.class]} >
    {
        children
    }
</div>
const Tab = ({ children, active, onClick }: { children: JSXOutput, active: boolean, onClick: QRL }) => <div 
    class={["w-full h-full px-4 py-3 border cursor-pointer select-none",
    "hover:text-black transition-colors",
    active ? 'text-black bg-black/10' : 'text-black/25']}
    onClick$={onClick}>
    { children }
</div>

// time to debounce in ms.
const DEBOUNCE = 250;
export default component$((p: Props) => {
    const open = useSignal(false)
    const permissions = useContext(permissionsCtx)
    const poles = useContext(polesCtx)
    const conn = useContext(connectionCtx)

    const menu = useSignal<Menu>(null)
    // Contient les modifications faites au pôle
    const modifications: Partial<Omit<SerializablePoles, 'id'>> = useStore({});
    const membres = useStore<{ id: string, text: string }[]>([])

    const insererMembre = $(async (item: { id: string, text: string }) => {
        const input = document.getElementById('researche-responsable') as HTMLInputElement | null;
        if(input) input.value = ''
        membres.splice(0, membres.length)
        if(modifications.responsables === undefined) {
            modifications.responsables = [...p.pole.responsables];
        }

        modifications.responsables.push({
            id: item.id,
            nom: item.text,
            prenom: ''
        })
    })
    const search = $((_: InputEvent, t: HTMLInputElement) => {
        console.log(t)
        const recherche = t.value;
        if(recherche.length === 0) {
            membres.splice(0, membres.length)
            return;
        }

        setTimeout(async () => {
            if(recherche !== t.value || !conn.value) return;

            const [ response ] = await conn.value.query<[{ id: RecordId, nom: string, prenom: string }[]]>(
                `SELECT id, nom, prenom FROM membres 
                WHERE 
                    string::contains(string::lowercase(nom), $search) 
                OR 
                    string::contains(string::lowercase(prenom), $search);`,
                {
                    search: recherche.toLowerCase()
                });

            membres.splice(0, membres.length);
            response
                .map(membre => ({
                    ...membre,
                    id: membre.id.id.toString(),
                }))
                .filter(membre => (
                    !(modifications.responsables === undefined && p.pole.responsables.includes(membre))
                    && !modifications.responsables?.includes(membre)
                ))
                .forEach(membre => {
                    membres.push({
                        id: membre.id,
                        text: membre.nom + ' ' + membre.prenom
                    })
                })
        }, DEBOUNCE)
    })

    return <div class="has-[.active]:text-black has-[.active]:text-base transition-all relative"
        document:onClick$={(e, t) => {
        const target = e.target as HTMLElement | null;
        if(!t.contains(target)) {
            menu.value = null;
            open.value = false;

            modifications.nom = undefined
            modifications.permissions = undefined
            modifications.poles = undefined
            modifications.responsables = undefined
        }
    }}>
        <p class="px-4 py-3 transition-colors bg-white hover:bg-black/10 cursor-pointer select-none 
            flex flex-row items-center gap-3" 
            onClick$={() => open.value = !open.value}>
            {
                p.pole.nom.length === 0
                ? <Slot/>
                : p.pole.nom
            }
        </p>
        {
            open.value && <LuX class="absolute top-0 right-0 w-12 h-12 p-3 
                hover:bg-red-200 cursor-pointer select-none"/>
        }
        {
            open.value && <div>
                <div class="active grid grid-cols-2 md:grid-cols-4
                items-center justify-center text-base">
                    <input type="text" 
                        onClick$={() => menu.value = null}
                        value={p.pole.nom}
                        onInput$={(_, t) => modifications.nom = t.value}
                        class="w-full h-full px-4 py-3 outline-none border
                            text-black/50 focus:text-black transition-colors"
                        placeholder="Pôle" />
                    <Tab
                        active={menu.value === 'permissions'}
                        onClick={$(() => menu.value = menu.value === 'permissions' ? null : 'permissions')}>
                        Permissions
                    </Tab>
                    <Tab
                        active={menu.value === 'poles'}
                        onClick={$(() => menu.value = menu.value === 'poles' ? null : 'poles')}>
                        Sous-pôles
                    </Tab>
                    <Tab
                        active={menu.value === 'responsables'}
                        onClick={$(() => menu.value = menu.value === 'responsables' ? null : 'responsables')}>
                        Responsables
                    </Tab>
                </div>
                <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 relative font-light">
                    {
                        menu.value === 'permissions' && permissions.map(perm => <Block
                            key={perm}
                            class={
                                (
                                    (modifications.permissions === undefined && p.pole.permissions.includes(perm)) 
                                    || modifications.permissions?.includes(perm)
                                ) 
                                && 'bg-blue-200 border-none'
                            }
                            onClick$={() => {
                                if(modifications.permissions === undefined) {
                                    // [...liste] <=> clone
                                    modifications.permissions = [...p.pole.permissions];
                                }

                                const index = modifications.permissions.indexOf(perm);
                                if(index >= 0) {
                                    modifications.permissions.splice(index, 1);
                                } else {
                                    modifications.permissions.push(perm)
                                }
                            }}>
                            {perm}
                        </Block>)
                    }
                    {
                        menu.value === 'poles' && poles.map(pole => <Block
                            key={pole.id}
                            onClick$={() => {
                                if(modifications.poles === undefined) {
                                    modifications.poles = [...p.pole.poles];
                                }

                                const index = modifications.poles.indexOf(pole.id);
                                if(index >= 0) {
                                    modifications.poles.splice(index, 1);
                                } else {
                                    modifications.poles.push(pole.id);
                                }
                            }}
                            class={
                                (
                                    modifications.poles === undefined && p.pole.poles.includes(pole.id)
                                    || modifications.poles?.includes(pole.id)
                                ) && 'bg-blue-200 border-none'}>
                            {pole.nom}
                        </Block>)
                    }
                    {
                        menu.value === 'responsables' && <>
                            {
                                (modifications.responsables === undefined 
                                    ? p.pole.responsables 
                                    : modifications.responsables).map(resp => <Block
                                    key={resp.id}
                                    onClick$={() => {
                                        if(modifications.permissions === undefined) {
                                            modifications.responsables = [...p.pole.responsables];
                                        }
                                        const index = modifications.responsables?.indexOf(resp)
                                        if(!modifications.responsables || index === undefined || index < 0) return;

                                        modifications.responsables.splice(index, 1)
                                    }}
                                    class="hover:bg-red-200">
                                    {resp.nom} {resp.prenom}
                                </Block>)
                            }
                            <Block class="!p-0">
                                <input id="researche-responsable" type="text" class="w-full h-full outline-none px-4 py-3"
                                    placeholder="Nouveau responsable"
                                    onInput$={search}/>
                                <Lists
                                    items={membres}
                                    select={insererMembre}
                                />
                            </Block>
                        </>
                    }
                    {
                        menu.value === null && <>
                            <Block class="hover:bg-green-600/25 hover:border-transparent"
                                onClick$={async () => {
                                    const success = await p.save(p.pole.id, modifications);
                                    if(success) {
                                        if(modifications.nom) {
                                            p.pole.nom = modifications.nom
                                            modifications.nom = undefined;
                                        }
                                        if(modifications.permissions) {
                                            p.pole.permissions = modifications.permissions;
                                            modifications.permissions = undefined;
                                        }
                                        if(modifications.poles) {
                                            p.pole.poles = modifications.poles;
                                            modifications.poles = undefined;
                                        }
                                        if(modifications.responsables) {
                                            p.pole.responsables = modifications.responsables;
                                            modifications.responsables = undefined;
                                        }
                                    }
                                    open.value = false;
                                }}>
                                Sauvegarder
                            </Block>
                            <Block onClick$={() => {
                                open.value = false;
                                modifications.nom = undefined;
                                modifications.responsables = undefined;
                                modifications.poles = undefined;
                                modifications.permissions = undefined;
                            }}>
                                Annuler
                            </Block>
                        </>
                            
                    }
                </div>
            </div>
        }
        
    </div>
})