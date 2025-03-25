import { component$, type QRL } from "@builder.io/qwik";

type Props = {
    items: {
        id: string;
        text: string;
    }[],
    select: QRL<(item: { id: string, text: string }) => Promise<void>>
}

export default component$(({ items, select }: Props) => {
    return <>
    {
        items.length !== 0 && <div 
            class="z-20 absolute top-full left-0 w-full max-h-96 bg-white border-b
            grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 
            overflow-y-scroll">
            {
                items.map(item => <div key={item.id}
                    class="px-3 py-2 w-full 
                        border border-black/5 border-collapse border-dashed
                        hover:bg-black/10 cursor-pointer"
                    onClick$={async () => await select(item)}>
                        {item.text}
                    </div>)
                }
            </div>
        }
    </>
})