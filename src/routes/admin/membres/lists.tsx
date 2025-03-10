import { component$, type QRL } from "@builder.io/qwik";

type Props = {
    membres: {
        id: string;
        membre: string;
    }[],
    select: QRL<(membre: { id: string, membre: string }) => Promise<void>>
}

export default component$(({ membres, select }: Props) => {
    return <>
    {
        membres.length !== 0 && <div 
            class="z-20 absolute top-full left-0 w-full max-h-96 bg-white border-b
            grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 
            overflow-y-scroll">
            {
                membres.map(membre => <div key={membre.id}
                    class="px-3 py-2 w-full 
                        border border-black/5 border-collapse border-dashed
                        hover:bg-black/10 cursor-pointer"
                    onClick$={async () => await select(membre)}>
                        {membre.membre}
                    </div>)
                }
            </div>
        }
    </>
})