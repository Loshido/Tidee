import { component$, useContext, useStore, useVisibleTask$ } from "@builder.io/qwik";
import { type DocumentHead, Link, useLocation, useNavigate } from "@builder.io/qwik-city";
import { LuArrowDownToLine, LuArrowLeft, LuDelete, LuUndo2 } from "@qwikest/icons/lucide";
import { until } from "~/components/membres/utils";
import Pole, { type PoleProps } from "~/components/poles/Pole";
import storage from "~/lib/local";
import cache from "~/lib/cache";
import { connectionCtx, notificationsCtx, permissionsCtx } from "~/routes/layout";
import Desc from "./Desc";
import Style from "./Style";
import Boutons from "./Boutons";
import Images from "./Images";

import { QUERY } from "..";
import type { RecordId } from "surrealdb";

type Pole = Omit<PoleProps, 'membres'>

export default component$(() => {
    const notifications = useContext(notificationsCtx)
    const permissions = useContext(permissionsCtx);
    const loc = useLocation()
    const nav = useNavigate()
    const conn = useContext(connectionCtx);
    const store = useStore<{ pole?: Required<Pole> }>({})
    
    useVisibleTask$(async () => {
        await until(
            () => permissions.length !== 0 && !!conn.value,
            100, // interval
            5000, // timeout duration
            () => { // timeout cb
                nav('/dash/poles')
            }
        );

        if(!permissions.includes('modifier_pole_' + loc.params.pole.toLowerCase())
            && !permissions.includes('modifier_poles')) {
            nav('/dash/poles')
            return;
        }

        const poles = await cache('poles', async () => {
            const response = await conn.value!.query<[(PoleProps & { id: RecordId })[]]>(QUERY);

            return response[0].map(pole => ({
                ...pole,
                id: pole.id.id.toString()
            }))
        }, 60 * 4 * 1000)

        const data = poles.find(pole => pole.nom === loc.params.pole)
    
        if(data) {
            if(!data.images) data.images = ['default:']
            if(!data.style) data.style = '';

            store.pole = data as Required<Pole>
            const id = document.getElementById('title')
            const css = document.getElementById('css')
            const html = document.getElementById('html')

            if(id) id.innerText = store.pole.nom;
            if(css) css.innerText = store.pole.style;
            if(html) html.innerText = store.pole.description;
        } else {
            nav('/dash/poles')
            return;
        }
    })

    return <>
        <section class="w-full h-full flex flex-col gap-4 p-2 sm:p-4 md:p-8">
            <Link class="px-3 py-1 select-none cursor-pointer 
                hover:bg-opacity-10 hover:bg-black transition-colors 
                w-fit flex flex-row items-center gap-2"
                href={`/dash/poles#pole-${loc.params.pole}`}>
                <LuArrowLeft/>
                Revenir aux pôles
            </Link>
            <h1 class="text-black text-xl sm:text-4xl font-black uppercase outline-none"
                contentEditable="true"
                id="title"
                onInput$={(_, t) => store.pole!.nom = t.innerText}/>
            <Style id="css"
                onInput$={(e, t) => {
                    e.preventDefault()
                    store.pole!.style = t.innerText
                } }
                onKeyDown$={e => {
                    if(e.key === "Tab") e.preventDefault()
                }}/>
            <Desc id="html"
                onInput$={(_, t) => store.pole!.description = t.innerText}
                onKeyDown$={e => {
                    if(e.key === "Tab") e.preventDefault()
                }}/>
            <Boutons>
                {
                    store.pole?.boutons.map((bouton, i) => <>
                        <input class="col-span-2 outline-none" type="text" key={i}
                            value={bouton.nom}
                            onInput$={(_, t) => {
                                bouton.nom = t.value;
                            }}/>
                        <input class="col-span-3 outline-none" type="text" key={i}
                            value={bouton.href}
                            onInput$={(_, t) => {
                                bouton.href = t.value;
                            }}/>
                        <div class="select-none cursor-pointer transition-colors h-full
                            flex flex-row items-center gap-1
                            hover:bg-opacity-5 hover:bg-black font-light text-sm"
                            onClick$={() => {
                                store.pole!.boutons.splice(i, 1)
                            }}
                            key={i}>
                            <LuDelete/>
                            supprimer
                        </div>
                    </>)
                }
                <div class="col-span-6 select-none cursor-pointer 
                    hover:bg-opacity-5 hover:bg-black transition-colors"
                    onClick$={() => {
                        store.pole!.boutons.push({
                            nom: '',
                            href: ''
                        })
                    }}>
                    Ajouter une ligne
                </div>
            </Boutons>
            <Images>
                {
                    store.pole?.images
                    .map(img => {
                        const [query, ...url] = img.split(':')
                        return [query, url.join(':')]
                    })
                    .map(([query, url], i) => query === 'default'
                    ? <>
                        <div class="px-3 py-2 border col-span-3" key={i}>
                            default
                        </div>
                        <input type="text" key={i} class="px-3 py-2 border outline-none col-span-4"
                            value={url}
                            onInput$={(_, t) =>{
                                store.pole!.images[i] = `default:${t.value}`
                            }}/>
                    </>
                    : <>
                        <input key={i} class="border outline-none w-full px-3 py-2  col-span-3" 
                            type="text"
                            value={query}
                            onInput$={(_, t) => {
                                store.pole!.images[i] = `${t.value}:${url}`
                            }}/>
                        <input key={i} type="text" class="px-3 py-2 border outline-none w-full col-span-3"
                            value={url}
                            onInput$={(_, t) => {
                                store.pole!.images[i] = `${query}:${t.value}`
                            }}/>
                        <div key={i} class="px-3 py-2 flex flex-row gap-2 select-none cursor-pointer items-center
                            transition-colors hover:bg-opacity-5 hover:bg-black font-light text-sm"
                            onClick$={() => {
                                store.pole!.images.splice(i, 1)
                            }}>
                            <LuDelete/>
                            supprimer
                        </div>
                    </>) 
                }
                <div class="col-span-7 select-none cursor-pointer 
                    hover:bg-opacity-5 hover:bg-black transition-colors"
                    onClick$={() => {
                        store.pole!.images.push(':');
                        store.pole!.images.sort((a, b) => {
                            const [tailleA] = a.split(':');
                            const [tailleB] = b.split(':');
                            console.log(tailleA, tailleB)
                            if(a.startsWith('default')) return 1;
                            else if(b.startsWith('default')) return -1;
                            else if(parseInt(tailleA) < parseInt(tailleB)) return -1;
                            return 1
                        })
                    }}>
                    Ajouter une image
                </div>
            </Images>
            <div class="flex flex-row items-center gap-4">
                <div class="px-3 py-1 select-none cursor-pointer 
                    bg-emerald-700 text-white
                    hover:bg-opacity-75 transition-colors 
                    w-fit flex flex-row items-center gap-2"
                    onClick$={async () => {
                        if(!store.pole || !conn.value) return;
                        await conn.value.query(`
                            UPDATE poles 
                            SET nom = $nom, 
                                meta.style = $style, 
                                meta.description = $desc,
                                meta.boutons = $boutons
                            WHERE nom = $id`, {
                                nom: store.pole.nom,
                                style: store.pole.style,
                                desc: store.pole.description,
                                boutons: store.pole.boutons,
                                id: loc.params.pole
                            });
                        notifications.push({
                            contenu: "Modifications envoyées.",
                            duration: 3
                        })
                        
                        storage.removeItem('poles')
                        
                        if(loc.params.pole !== store.pole.nom) {
                            nav('/dash/poles/' + store.pole.nom);
                        }
                    }}>
                    <LuArrowDownToLine/>
                    Sauvegarder
                </div>
                <div class="px-3 py-1 select-none cursor-pointer 
                    bg-black bg-opacity-10
                    hover:bg-red-200 transition-colors 
                    w-fit flex flex-row items-center gap-2"
                    onClick$={async () => {
                        const poles = await cache('poles', async () => {
                            const response = await conn.value!.query<[(PoleProps & { id: RecordId })[]]>(QUERY);
                
                            return response[0].map(pole => ({
                                ...pole,
                                id: pole.id.id.toString()
                            }))
                        }, 60 * 4 * 1000)
                
                        const data = poles.find(pole => pole.nom === loc.params.pole)
                        if(!data) {
                            notifications.push({
                                contenu: "Pôle introuvable.",
                                duration: 3
                            })
                            return
                        };
                        if(!data?.images) data.images = ['default:']
                        if(!data.style) data.style = '';
            
                        store.pole = data as Required<Pole>
                        const id = document.getElementById('title')
                        const css = document.getElementById('css')
                        const html = document.getElementById('html')
            
                        if(id) id.innerText = store.pole.nom;
                        if(css) css.innerText = store.pole.style;
                        if(html) html.innerText = store.pole.description;
                    }}>
                    <LuUndo2/>
                    Annuler
                </div>
            </div>
        </section>
        {
            store.pole && <Pole
                class="w-screen h-screen"
                id={store.pole.id}
                nom={store.pole.nom}
                description={store.pole.description}
                boutons={store.pole.boutons}
                style={store.pole.style}
                images={store.pole.images}
                membres={[{
                    nb: 0,
                    heures: 0
                }]}/>
        }

    </>
})

export const head: DocumentHead = (e) => ({
    title: 'Tidee - Edition ' + e.params.pole,
    frontmatter: {
        dash: false
    }
})