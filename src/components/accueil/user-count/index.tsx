import { component$, PropsOf } from "@builder.io/qwik";

interface Props extends PropsOf<'div'> {
    compte: string | number,
    legende: string
}

export default component$(({ compte, legende, ...props}: Props) => {
    return <div {...props} class={["px-5 py-4 w-full h-full border rounded flex items-center", props.class && props.class]}>
        <h1 class="text-2xl font-semibold leading-4">
            {compte} <span class="text-black/50 font-normal text-sm">{ legende }</span>
        </h1>
    </div>
})