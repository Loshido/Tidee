import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { LuChevronsUpDown } from "@qwikest/icons/lucide";

export default component$(() => {
    return <section class="p-5 sm:p-10">
        <div class="text-2xl font-medium
            flex flex-row gap-2 items-center">
            Appel du pôle 
            <div class="px-2 py-1 border rounded flex flex-row gap-2 items-center 
                hover:bg-black hover:bg-opacity-5 transition-colors cursor-pointer select-none">
                <LuChevronsUpDown class="w-4 h-4"/>
                selection du pôle
            </div>
            pour la semaine du ... ...
        </div>

        <p>
            Tableau avec les membres    
        </p>        
    </section>
})

export const head: DocumentHead = {
    title: "Tidee - Appels"
};