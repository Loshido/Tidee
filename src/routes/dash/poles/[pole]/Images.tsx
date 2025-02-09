import { component$, Slot } from "@builder.io/qwik";

export default component$(() => <div>
    <code class="italic text-black text-opacity-25">
        images
    </code>
    <div class="grid grid-cols-7 *:border *:px-3 *:py-2 my-2 text-xs sm:text-base lg:w-3/4">
        <div class="col-span-3 font-semibold">
            Taille d'écran <span class="text-xs font-light">(en px)</span>
        </div>
        <div class="col-span-4 font-semibold">
            URL
            <br/>
            <span class="text-xs font-light hidden md:block">
                (ex: <code>
                    https://where.ever/image.png
                </code>)
            </span>
        </div>
        <Slot/>
    </div>
</div>) 