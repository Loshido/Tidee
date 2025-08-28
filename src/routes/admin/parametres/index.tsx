import { component$ } from "@builder.io/qwik";

export default component$(() => {
    return <section class="flex flex-col gap-4 w-full h-full px-4 py-8 md:p-32 bg-orange-50">
        {/* <h1 class="text-2xl">
            Paramètres
        </h1>

        <ol class="list-inside list-decimal px-2">
            <li>Vérifier les permissions</li>
            <li>Permettre de gérer la durée du cache de chaque requête</li>
            <li>Gérer les couleurs primaire de l'application</li>
            <li>Possibilité modifier le css de l'application</li>
        </ol> */}
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