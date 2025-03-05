import { component$, type PropsOf } from "@builder.io/qwik";

interface Props extends PropsOf<'input'> {
    name: string
}

export default component$(({name, ...props}: Props) => {
    return <div class="bg-black/5 px-3 py-1.5 rounded w-fit">
        <p class="text-xs font-light">{name}</p>
        <input {...props}
            class={[
                "text-lg font-medium outline-none bg-transparent",
                props.class && props.class]} />
    </div>
})