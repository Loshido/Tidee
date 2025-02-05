import { component$, useContext, type PropsOf } from "@builder.io/qwik";
import { Link, type LinkProps } from "@builder.io/qwik-city";
import { LuClock, LuPencil, LuUsers } from "@qwikest/icons/lucide";
import { permissionsCtx } from "~/routes/layout";

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
    images?: string[],
    membres: [{
        heures: number,
        nb: number
    }]
}


export default component$((p: PoleProps & PropsOf<'div'>) => {
    const permissions = useContext(permissionsCtx)
    
    return <div {...p} id={'pole-' + p.nom} class={[
        "snap-center w-full h-full p-8 sm:p-24",
        "flex flex-col gap-2 sm:gap-8 flex-none relative",
        "pole-container-" + p.nom.toLowerCase(),
        "pole-container", p.images ? 'bg-transparent' : 'bg-black'
        ]}>
        {
            p.style && <style dangerouslySetInnerHTML={p.style}/>
        }
        <h1 class="text-white text-4xl sm:text-6xl md:text-8xl font-black uppercase">
            { p.nom }
        </h1>
        <p 
            class="text-white text-opacity-50 font-light text-lg sm:text-xl sm:w-4/5 md:w-3/5" 
            dangerouslySetInnerHTML={p.description}/>
        <div class="flex flex-row items-center gap-5 flex-wrap text-white">
            <div class="flex flex-row gap-3 items-center flex-wrap"
                title="Nombre de membres">
                <LuUsers/>
                { p.membres[0].nb }
            </div>
            <div class="flex flex-row gap-3 items-center flex-wrap"
                title="Nombre d'heures par membre en moyenne">
                <LuClock/>
                { Math.ceil(p.membres[0].heures) }h
            </div>
        </div>
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
            p.images && <picture
                class="-z-10 absolute top-0 left-0 w-full h-full object-cover">
                    {
                        p.images
                            .map(img => img.split(':'))
                            .map(([media, url]) => 
                                media === 'default'
                                ? <img key={media} 
                                        src={url} alt="Bannière pôle" 
                                        class="w-full h-full" loading="lazy" />
                                : <source key={media}
                                        media={media}
                                        srcset={url}/>
                                )
                    }
                </picture>
        }
        {
            permissions.includes('modifier_pole_' + p.nom.toLowerCase()) && <Link 
                href={`/dash/poles/${p.nom.toLowerCase()}`}
                class="absolute p-3 right-6 bottom-6 text-white hover:bg-white hover:bg-opacity-10 
                    cursor-pointer transition-colors rounded">
                <LuPencil/>
            </Link>
        }
    </div>
})