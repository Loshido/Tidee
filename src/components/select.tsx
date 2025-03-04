import { component$, type QRL, useSignal } from "@builder.io/qwik";
import { LuChevronsUpDown } from "@qwikest/icons/lucide";

interface Selection {
    selected?: string,
    nom: string,
    items: {
        id: string,
        nom: string,
        style?: string
    }[],
    select: QRL<(id: string) => void>
}

export default component$((s: Selection) => {
    const open = useSignal(false)

    return <div class="px-2 py-1 border rounded flex flex-row gap-2 items-center relative 
        hover:bg-black hover:bg-opacity-5 transition-colors cursor-pointer select-none
        min-w-48"
        document:onClick$={(e, t) => {
            if(s.items.length == 1) return;
            
            if(t.contains(e.target as HTMLElement)) {
                open.value = !open.value
            } else open.value = false;
        }}>
        {
            s.items.length > 1 && <LuChevronsUpDown class="w-4 h-4"/>
        }
        {
            s.selected ? s.selected : s.nom
        }
        <div id="select-options" class={["absolute top-full mt-2 left-0 rounded p-1",
            "flex-col bg-white bg-opacity-50 backdrop-blur w-full gap-1 border",
            open.value ? 'flex' : 'hidden']}>
            {
                s.items.map(item => <div key={item.id} style={item.style}
                    class="px-2 py-1 w-full rounded
                        transition-colors hover:bg-black hover:bg-opacity-10 "
                    onClick$={() => s.select(item.id)}>
                    {
                        item.nom
                    }
                </div>)
            }
        </div>
    </div>
})