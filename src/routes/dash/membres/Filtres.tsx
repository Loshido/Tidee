import { component$, PropsOf, QRL, Slot, useStore } from "@builder.io/qwik";
import { LuChevronDown, LuSearch } from "@qwikest/icons/lucide";

// Chacun des filtres
export const Item = component$((props: PropsOf<'div'>) => <div 
    {...props}
    class={["bg-black bg-opacity-5 flex flex-row gap-2",
        "px-2 py-1 rounded items-center select-none",
        "cursor-pointer hover:bg-opacity-10 transition-colors relative",
        props.class]}>
    <Slot/>
</div>)

export const Dropdown = component$((props: PropsOf<'div'>) => <div
    {...props}
    data-option
    class={[props.class,
        "absolute top-[125%] left-0",
        "bg-white rounded border p-1 gap-1",
        "flex flex-col w-max"
    ]}>
    <Slot/>
</div>)

export const Option = component$((props: PropsOf<'div'>) => <div
    {...props}
    data-option
    class={[props.class,
        "px-3 py-1.5 flex flex-row items-center gap-2",
        "hover:bg-black hover:bg-opacity-5 rounded transition-colors"
    ]}>
    <Slot/>
</div>)

interface Filtres {
    recherche: QRL<(query: string) => void>,
    filtres: QRL<(poles: string[], promotions: string[]) => void>,
    poles: string[],
    promotions: string[]
}

interface Data {
    recherche: string,
    poles: string[],
    promotions: string[]
}

const DEBOUNCE_TIME = 250 //ms
export default component$((props: Filtres) => {
    const data = useStore<Data>({
        recherche: '',
        poles: [],
        promotions: []
    })

    const menu = useStore({
        poles: false,
        promotions: false
    })

    return <div class="flex flex-row flex-wrap gap-2 w-fit items-center px-5 text-sm">
        <Item class="py-1.5 cursor-default">
            <LuSearch />
            <input type="text" autocomplete="off" autoComplete="off" autoFocus={false}
                class="bg-transparent outline-none" 
                placeholder="Rechercher un membre..." 
                onInput$={(_, t) => {
                    data.recherche = t.value;
                    const copy = (' ' + t.value).slice(1); // deep copy

                    // Debounce
                    // On lance le filtre lorsque 
                    // l'utilisateur a fini de taper sa recherche.
                    setTimeout(() => {
                        if(data.recherche === copy) {
                            props.recherche(data.recherche);
                        }
                    }, DEBOUNCE_TIME)
                }}/>
        </Item>
        <Item onClick$={(e) => {
                if((e.target as HTMLElement).hasAttribute('data-option')) return
                menu.poles = !menu.poles
                menu.promotions = false
            }}>
            <div class="flex flex-row gap-2 items-center"
                >
                <LuChevronDown class={[
                    "transition-transform duration-300",
                    menu.poles ? 'rotate-180' : ''
                ]}/>
                Poles
            </div>
            <Dropdown class={menu.poles ? '' : 'hidden'}>
            {
                props.poles.map(pole => <Option 
                    key={pole}
                    class={data.poles.includes(pole) ? 'bg-black bg-opacity-15' : ''}
                    onClick$={() => {
                        if(data.poles.includes(pole)) {
                            const i = data.poles.findIndex(p => p == pole)
                            data.poles.splice(i, 1);
                        } else {
                            data.poles.push(pole);
                        }

                        const copy = [...data.poles];
                        setTimeout(() => {
                            if(copy.every((e, i) => data.poles[i] === e)) {
                                props.filtres(data.poles, data.promotions);
                            }
                        }, DEBOUNCE_TIME)
                    }}>
                    {
                        pole
                    }
                </Option>)
            }
            </Dropdown>
        </Item>
        <Item 
            onClick$={(e) => {
                if((e.target as HTMLElement).hasAttribute('data-option')) return
                menu.promotions = !menu.promotions
                menu.poles = false
            }}>
            <div class="flex flex-row gap-2 items-center">
                <LuChevronDown class={[
                    "transition-transform duration-300",
                    menu.promotions ? 'rotate-180' : ''
                ]}/>
                Promotion
            </div>
            <Dropdown class={menu.promotions ? '' : 'hidden'}>
            {
                props.promotions.map(promo => <Option 
                    key={promo}
                    class={data.promotions.includes(promo) ? 'bg-black bg-opacity-15' : ''}
                    onClick$={() => {
                        if(data.promotions.includes(promo)) {
                            const i = data.promotions.findIndex(p => p == promo)
                            data.promotions.splice(i, 1);
                        } else {
                            data.promotions.push(promo);
                        }

                        const copy = [...data.promotions];
                        setTimeout(() => {
                            if(copy.every((e, i) => data.promotions[i] === e)) {
                                props.filtres(data.poles, data.promotions);
                            }
                        }, DEBOUNCE_TIME)
                    }}>
                    {
                        promo
                    }
                </Option>)
            }
            </Dropdown>
        </Item>
    </div>
})