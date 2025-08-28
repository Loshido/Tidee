import { component$ } from "@builder.io/qwik";

export default component$(() => {
    return <section class="flex flex-col gap-4 w-full h-full px-4 py-8 md:p-32 bg-orange-50">
        {/* Accueil */}
        <div class="w-fit">
            <h2 class="text-4xl font-bold text-orange-500">
                🚧 Développement suspendu,
            </h2>
            <p class="text-xl text-orange-400/50">
                vous pouvez contactez le pôle serveur pour faire une demande
            </p>
        </div>
    </section>
})