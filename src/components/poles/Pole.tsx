import { component$, useContext, type PropsOf } from "@builder.io/qwik";
import { Link, useLocation, type LinkProps } from "@builder.io/qwik-city";
import { LuClock, LuPencil, LuUsers } from "@qwikest/icons/lucide";
import { permissionsCtx } from "~/routes/layout";

export interface PoleProps {
    id: string,
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
    membres: {
        heures: number,
        nb: number
    }
}


export default component$((p: PoleProps & PropsOf<'div'>) => {
    const loc = useLocation()
    const permissions = useContext(permissionsCtx)
    
    return <div {...p} id={'pole-' + p.nom} class={[
        "snap-center w-full h-full p-8 sm:p-24 overflow-hidden",
        "flex flex-col gap-2 sm:gap-8 flex-none relative",
        "pole-container-" + p.nom.toLowerCase(),
        "pole-container", (p.images && p.images.length >= 1) ? 'bg-transparent' : 'bg-black',
        p.class && p.class
        ]}>
        {
            p.style && <style dangerouslySetInnerHTML={p.style}/>
        }
        <h1 class="text-white text-4xl sm:text-6xl md:text-8xl font-black uppercase">
            { p.nom }
        </h1>
        <div 
            class="text-white text-opacity-50 font-light text-lg sm:text-xl sm:w-4/5 md:w-3/5" 
            dangerouslySetInnerHTML={p.description}/>
        <div class="stats flex flex-row items-center gap-5 flex-wrap text-white">
            <div class="flex flex-row gap-3 items-center flex-wrap"
                title="Nombre de membres">
                <LuUsers/>
                { p.membres.nb }
            </div>
            <div class="flex flex-row gap-3 items-center flex-wrap"
                title="Nombre d'heures par membre en moyenne">
                <LuClock/>
                { Math.ceil(p.membres.heures) }h
            </div>
        </div>
        <div class="btn flex flex-row items-center gap-4 flex-wrap">
            {
                p.boutons.map(({ nom, ...props }) => <Link {...props} 
                    key={nom} target="_blank"
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
                            .map(img => {
                                const [query, ...url] = img.split(':')
                                return [query, url.join(':')]
                            })
                            .map(([media, url]) => 
                                media === 'default'
                            ? (
                                url.length === 0
                                ? undefined
                                    // eslint-disable-next-line
                                    : <img key={media} 
                                        src={url} alt="" 
                                        class="w-full h-full" loading="lazy" />
                                )
                                : <source key={media}
                                        media={`(width < ${media}px)`}
                                        srcset={url}/>
                                )
                    }
                </picture>
        }
        {
            loc.url.pathname == '/dash/poles/' 
            && (    
                permissions.includes('modifier_pole_' + p.nom.toLowerCase()) 
                || permissions.includes('modifier_poles'))
            && <Link 
                href={`/dash/poles/${p.nom}`}
                class="absolute p-2 right-4 top-4 text-white text-sm hover:bg-white hover:bg-opacity-10 
                    cursor-pointer transition-colors rounded"
                    title="Modifier le pôle">
                <LuPencil/>
            </Link>
        }
    </div>
})