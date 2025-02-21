import { component$, Slot } from "@builder.io/qwik";
import { Link, type LinkProps } from "@builder.io/qwik-city";

export default component$((props: LinkProps) => {
    return <Link {...props} class={[ props.class && props.class,
        "border rounded flex items-center justify-center gap-2",
        "hover:bg-white/50 cursor-pointer transition-colors",
        "px-4 py-2 bg-white/25"
    ]}>
        <Slot/>
    </Link>
})