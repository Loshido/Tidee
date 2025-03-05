import { component$, QRL, useSignal } from "@builder.io/qwik";
import type { SerializablePoles } from "./types"

type Props = {
    pole: SerializablePoles,
    save: QRL<(id: string, modification: Partial<Omit<SerializablePoles, 'id'>>) => Promise<void>>
}

export default component$((p: Props) => {
    const open = useSignal(false)
    return <div class=""
        document:onClick$={(e, t) => {
        const target = e.target as HTMLElement | null;
        if(!t.contains(target)) {
            open.value = false;
        }
    }}>
        <p class="px-4 py-3 transition-colors bg-white hover:bg-black/10 cursor-pointer select-none" 
            onClick$={() => open.value = !open.value}>
            {
                p.pole.nom
            }
        </p>

        <div class={[
            open.value ? 'block border-t p-5' : 'hidden']}>
            <pre class="text-sm font-light">
                {
                    JSON.stringify(p.pole, undefined, 4)
                }
            </pre>
        </div>
    </div>
})