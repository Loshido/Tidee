import { component$, QRL, Slot } from "@builder.io/qwik";
import { type SerializableMembre } from "./utils";
import { Link } from "@builder.io/qwik-city";

interface EditionProps {
    membre?: SerializableMembre,
    exit: QRL
}

export const Cell = component$(() => {
    return <div class="px-2 py-1 bg-white rounded">
        <Slot/>
    </div>
})

export default component$(({ membre, exit }: EditionProps) => {
    return membre
    ? <section id="edition" class="fixed top-0 w-full h-screen backdrop-blur-sm" 
        onClick$={(e, t) => e.target === t ? exit() : null }>
        <div class="w-full sm:w-3/4 h-full bg-white sm:bg-black bg-opacity-75 sm:bg-opacity-10 ml-auto p-5 border-l backdrop-blur-3xl
            flex flex-col gap-1">
            <Link onClick$={exit}
                class="sm:hidden text-sm font-light cursor-pointer select-none h-fit w-fit
                    hover:text-black hover:text-opacity-25 transition-colors">
                Revenir en arrière
            </Link>
        </div>
    </section>
    : null
})