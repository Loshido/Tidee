import { component$ } from "@builder.io/qwik";
import { DocumentHead, Link } from "@builder.io/qwik-city";

import Cat from "~/assets/cat.png?jsx"
export default component$(() => {
    return <section class="w-dvw h-dvh">
        <Link href="/" class="absolute top-4 left-4 font-light
        hover:text-black hover:text-opacity-25 transition-colors">
            Revenir en arrière
        </Link>
        <div class="justify-center items-center h-full flex flex-row gap-12">
            <Cat style={{height: '50vh', width: 'auto'}}/>
            <div>
                <h1 class="font-semibold text-xl">
                    Mots de passe oublié...
                </h1>
                <p>Voici les options qui s'offrent à vous:</p>
                <ul class="list-disc list-inside ml-2">
                    <li>
                        Contactez le président de votre association
                    </li>
                    <li>
                        Contactez le responsable de la maintenace de la plateforme.
                    </li>
                </ul>
            </div>
        </div>
    </section>
})

export const head: DocumentHead = {
    title: "Tidee - Mots de passe oublié",
};
