import { component$, PropsOf, Slot } from "@builder.io/qwik";

export default component$((props: PropsOf<'pre'>) => <div>
    <code class="italic text-black text-opacity-25">
        style.css
    </code>
    <pre {...props} 
        contentEditable="true" 
        class="border p-4 outline-none my-2 overflow-scroll text-xs sm:text-base"/>
</div>)