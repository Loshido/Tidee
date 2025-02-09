import { component$, Slot } from "@builder.io/qwik";

export default component$(() => <div>
    <code class="italic text-black text-opacity-25">
        boutons
    </code>
    <div class="grid grid-cols-6 *:border *:px-3 *:py-2 my-2 text-xs sm:text-base lg:w-3/4">
        <div class="col-span-2 font-semibold">
            Nom
        </div>
        <div class="col-span-4 font-semibold">
            URL
            <br/>
            <span class="text-xs font-light hidden md:block">
                (ex: <code>
                    https://google.com
                </code>)
            </span>
        </div>
        <Slot/>
    </div>
</div>) 