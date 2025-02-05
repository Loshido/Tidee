import { $, component$, PropsOf, useContext, useStore, useVisibleTask$ } from "@builder.io/qwik";
import { DocumentHead, Link, useLocation, useNavigate } from "@builder.io/qwik-city";
import { LuArrowDownToLine, LuArrowLeft, LuUndo2 } from "@qwikest/icons/lucide";
import { until } from "~/components/membres/utils";
import Pole, { PoleProps } from "~/components/poles/Pole";
import storage, { cache } from "~/lib/local";
import { connectionCtx, permissionsCtx } from "~/routes/layout";

const QUERY = `SELECT 
    nom, 
    meta.boutons as boutons, 
    meta.description as description, 
    meta.style as style, 
    meta.images as images
FROM poles
WHERE nom = $nom;`;

type Pole = Omit<PoleProps, 'membres'>

export default component$(() => {
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

        if(!permissions.includes('modifier_pole_' + loc.params.pole.toLowerCase())) {
            nav('/dash/poles')
            return;
        }

        const data = await cache('pole-' + loc.params.pole, 60 * 10, async () => {
            const response = await conn.value!.query<[Pole[]]>(QUERY, {
                nom: loc.params.pole
            });

            return response[0]
        })
    
        if(data.length > 0) {
            if(!data[0].images) data[0].images = ['default:']
            if(!data[0].style) data[0].style = '';

            store.pole = data[0] as Required<Pole>
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
            <div>
                <code class="italic text-black text-opacity-25">
                    style.css
                </code>
                <pre
                    id="css"
                    onInput$={(e, t) => {
                        e.preventDefault()
                        store.pole!.style = t.innerText
                    } }
                    onKeyDown$={(e, t) => {
                        if(e.key === "Tab") {
                            e.preventDefault()
                            // it simulates a tabulation 
                            // (but the cursor goes at the beginning...)
                            // const style = store.pole!.style;
                            // const s = e.view?.getSelection()
                            // if(!s || !s.anchorNode?.nodeValue) return

                            // const anchor = s.anchorNode;
                            // const offset = s.anchorOffset;

                            // if(!anchor.nodeValue) return;
                            // const i = style.indexOf(anchor.nodeValue) + offset;

                            // if(i >= 0 && i < style.length) {
                            //     store.pole!.style = style.slice(0, i) + '    ' + style.slice(i)
                            // }
                        }
                    }}
                    contentEditable="true" 
                    class="border p-4 outline-none my-2 overflow-scroll text-xs sm:text-base"/>
            </div>
            <div>
                <code class="italic text-black text-opacity-25">
                    description.html
                </code>
                <pre
                    id="html"
                    onInput$={(_, t) => store.pole!.description = t.innerText}
                    contentEditable="true" 
                    onKeyDown$={(e, t) => {
                        if(e.key === "Tab") e.preventDefault()
                    }}
                    class="border p-4 outline-none my-2 overflow-scroll text-xs sm:text-base"/>
            </div>
            <div>
                <code class="italic text-black text-opacity-25">
                    boutons
                </code>
                <div class="grid grid-cols-5 *:border *:px-3 *:py-2 my-2 text-xs sm:text-base lg:w-3/4">
                    <div class="col-span-2 font-semibold">
                        Nom
                    </div>
                    <div class="col-span-3 font-semibold">
                        URL <code class="hidden sm:inline text-sm">[...&lt;attribute&gt;:&lt;value&gt;]</code>
                        <br/>
                        <span class="text-xs font-light hidden md:block">
                            (ex: <code>
                                https://google.com target:_blank style:'color:blue;text-decoration:unset'
                            </code>)
                        </span>
                    </div>
                    {
                        store.pole?.boutons.map((bouton, i) => <>
                            <input class="col-span-2 outline-none" type="text"
                                value={bouton.nom}
                                onInput$={(_, t) => {
                                    bouton.nom = t.value;
                                }}/>
                            <input class="col-span-2 outline-none" type="text"
                                // à finir
                                value={bouton.href}
                                onInput$={(_, t) => {
                                    bouton.href = t.value;
                                }}/>
                            <div class="select-none cursor-pointer transition-colors h-full flex items-center
                                hover:bg-opacity-5 hover:bg-black font-light text-sm"
                                onClick$={() => {
                                    store.pole!.boutons.splice(i, 1)
                                }}>
                                supprimer
                            </div>
                        </>)
                    }
                    <div class="col-span-5 select-none cursor-pointer 
                        hover:bg-opacity-5 hover:bg-black transition-colors"
                        onClick$={() => {
                            store.pole!.boutons.push({
                                nom: '',
                                href: ''
                            })
                        }}>
                        Ajouter une ligne
                    </div>
                </div>
            </div>
            <div class="flex flex-row items-center gap-4">
                <div class="px-3 py-1 select-none cursor-pointer 
                    bg-emerald-700 text-white
                    hover:bg-opacity-75 transition-colors 
                    w-fit flex flex-row items-center gap-2"
                    onClick$={async () => {
                        if(!store.pole || !conn.value) return;
                        await conn.value?.query(`
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
                        
                        storage.removeItem('poles')
                        storage.removeItem('pole-' + loc.params.pole)
                        
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
                        const response = await conn.value!.query<[Pole[]]>(QUERY, {
                            nom: loc.params.pole
                        });
                        if(response[0].length === 0) return
                        const p = response[0][0]
                        if(!p.images) p.images = ['default:']
                        if(!p.style) p.style = '';
            
                        store.pole = p as Required<Pole>
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
    title: 'Tidee - ' + e.params.pole,
    frontmatter: {
        dash: false
    }
})