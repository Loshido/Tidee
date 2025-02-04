import { component$ } from "@builder.io/qwik";
import { Link, type LinkProps } from "@builder.io/qwik-city";

export interface PoleProps {
    // Nom affiché du pôle (sera mis en majuscule)
    nom: string,
    // Description (rendu en html)
    description: string,
    // Style de la page, on note que le conteneur sera atteignable via .pole-container-[nom du pole en minuscule]
    style?: string,
    boutons: (
        // Boutons pour des sites externes
        LinkProps & { nom: string}
    )[],
    image?: {
        // media-query: image-url
        [key: string]: string,
        default: string

        // De cette façon, on peut afficher une image pour chaque appareil
    }
}

export default component$((p: PoleProps) => {
    
    return <div class={[
        "snap-center w-full h-full p-8 sm:p-24",
        "flex flex-col gap-2 sm:gap-8 flex-none relative",
        "pole-container-" + p.nom.toLowerCase(),
        "pole-container", p.image ? 'bg-transparent' : 'bg-black'
        ]}>
        {
            p.style && <style>
                {
                    p.style
                }
            </style>
        }
        <h1 class="text-white text-6xl sm:text-8xl font-black uppercase">
            { p.nom }
        </h1>
        <p 
            class="text-white text-opacity-50 font-light text-lg sm:text-xl sm:w-3/5" 
            dangerouslySetInnerHTML={p.description}/>
        <div class="flex flex-row items-center gap-4 flex-wrap">
            <Link class="bg-white px-3 py-1 text-xl font-semibold uppercase 
                select-none cursor-pointer hover:bg-opacity-75 transition-colors">
                Rejoindre
            </Link>
            <Link class="bg-white bg-opacity-75 px-3 py-1 text-xl font-semibold uppercase 
                select-none cursor-pointer hover:bg-opacity-50 transition-colors">
                En savoir plus
            </Link>
            {
                p.boutons.map(({ nom, ...props }) => <Link {...props} 
                    key={nom}
                    class="bg-white px-3 py-1 text-xl font-semibold uppercase 
                    select-none cursor-pointer hover:bg-opacity-75 transition-colors">
                    { nom }
                </Link>)
            }
        </div>
        {
            p.image && <picture
                class="-z-10 absolute top-0 left-0 w-full h-full object-cover">
                    {
                        Object
                            .keys(p.image)
                            .filter(k => k !== 'default')
                            .map(media => <source
                                key={media}
                                media={media}
                                // @ts-ignore
                                src={p.image[media]}/>)
                    }
                    <img src={p.image['default']} alt="Bannière pôle" class="w-full h-full" loading="lazy" />
            </picture>
        }
    </div>
})