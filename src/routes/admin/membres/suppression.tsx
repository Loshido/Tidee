import { component$, QRL, useSignal } from "@builder.io/qwik";
import { LuX } from "@qwikest/icons/lucide";

type Props = {
    name: string,
    delete: QRL,
}

export default component$((props: Props) => {
    const open = useSignal(false)
    return <>
        <div onClick$={() => open.value = true}
            class="px-2 py-1 border rounded flex flex-row gap-2 items-center 
            hover:bg-red-400 hover:bg-opacity-5 transition-colors cursor-pointer select-none">
            <LuX class="w-4 h-4"/>
            Supprimer
        </div>
        <dialog open 
            onClick$={async (e) => {
                if(document.getElementById('boutons-confirmation')
                    ?.contains(e.target as HTMLElement | null) === false) {
                    open.value = false;
                }
            }}
            class={["z-50 top-0 left-0 cursor-default",
                "w-screen h-screen flex flex-col justify-center items-center gap-4",
                "bg-white/25 backdrop-blur-sm",
                open.value ? 'flex' : 'hidden']}>
            <div class="text-center text-xl">
                <h3>
                    Voulez-vous vraiment supprimer {props.name} ?
                </h3>
                <em class="text-red-500 font-light">
                    ⚠️ Cette action est irréversible!
                </em>
            </div>

            <div id="boutons-confirmation" class="flex flex-row items-center justify-center gap-4 
                *:transition-colors *:cursor-pointer select-none">
                <div class="px-3 py-1 text-white font-semibold 
                    bg-pink-600 hover:bg-pink-400"
                    onClick$={props.delete}>
                    Supprimer
                </div>
                <div class="px-3 py-1 bg-black/10 hover:bg-black/5"
                    onClick$={() => open.value = false}>
                    Revenir
                </div>
            </div>
        </dialog>
    </> 
})