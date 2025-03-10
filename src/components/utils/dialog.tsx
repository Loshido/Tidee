import { component$, JSXOutput, QRL } from "@builder.io/qwik";

type Props = {
    open: boolean,
    class?: string,
    message: string,
    close: QRL,
    actions: {
        slot: JSXOutput,
        onClick: QRL,
    }[]
}

export default component$((p: Props) => {
    return <dialog open class={[
        p.class && p.class, p.open ? 'flex' : 'hidden',
        "w-screen h-screen absolute top-0 left-0 z-50",
        "bg-white/50 backdrop-blur items-center justify-center gap-2 flex-col"]}>
        <div class="text-center">
            { p.message }
        </div>
        <div class="flex flex-row gap-2 items-center justify-center *:transition-colors *:cursor-pointer select-none"
            document:onClick$={async (e, t) => {
                const target = e.target as HTMLElement | null;
                if(target && !t.contains(target)) {
                    await p.close()
                }
            }}>
            {
                p.actions.map((action, i) => <div key={i} onClick$={action.onClick}>
                    {action.slot}
                </div>)
            }
        </div>
    </dialog>
})