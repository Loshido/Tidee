import { $, component$, type JSXOutput, type QRL, Slot, useSignal, useStore } from "@builder.io/qwik";

interface Props {
    items: {
        active: boolean,
        slot: JSXOutput,
        onClick: QRL<() => void>
    }[] 
}

export default component$(({ items }: Props) => {
    const open = useSignal(false)
    // another store that holds unupdated active items
    const actives = useStore<{ [key: number]: boolean }>({})
    
    return <div class="z-10 relative select-none h-fit"
        document:onClick$={(event, el) => {
            const target = event.target as HTMLElement | null;
            if(target && !el.contains(target) && open.value) {
                // When the click is outside & the menu is open
                open.value = false;
            }
        }}>
        <div class="bg-black/5 px-3 py-1.5 rounded w-fit
            flex flex-row gap-2 items-center text-lg font-medium
            hover:bg-black/10 cursor-pointer transition-colors"
            onClick$={() => open.value = !open.value}>
            <Slot/>
        </div>
        <div
            class={[
                open.value ? 'flex' : 'hidden',
                "absolute top-full left-0 rounded border",
                "flex-col mt-2 text-sm"
            ]}>
            {
                items.map((item, i) => <div 
                    key={i}
                    class={[
                        (i in actives ? actives[i] : item.active) 
                        ? 'bg-blue-100' 
                        : 'bg-white',
                        "p-2 hover:bg-neutral-300 cursor-pointer transition-colors"
                    ]}
                    onClick$={[item.onClick, $(() => {
                        if(i in actives) {
                            actives[i] = !actives[i]
                        } else actives[i] = !item.active
                    })]}>
                    {
                        item.slot
                    }
                </div>)
            }
        </div>
    </div>
})