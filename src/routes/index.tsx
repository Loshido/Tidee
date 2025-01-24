import { component$, useContext, useStore } from "@builder.io/qwik";
import { Form, Link, useNavigate, type DocumentHead } from "@builder.io/qwik-city";

import Tide from "~/assets/tide_logo.png?jsx"
import FlowField from "~/components/utils/FlowField";
import { connectionCtx } from "./layout";

export default component$(() => {
    const nav = useNavigate()
    const data = useStore({
        email: '',
        pass: '',
        errors: '',
    })
    const conn = useContext(connectionCtx);

    return <section class="grid grid-rows-2 md:items-center gap-10 
        p-5 md:p-10 w-screen h-screen
        md:grid-cols-2 md:grid-rows-1">
        <FlowField/> 
        <Form
            preventdefault:submit={true}
            class="w-full h-auto lg:h-fit 
            backdrop-blur-sm p-4 md:p-8 rounded-lg flex flex-col gap-4
            bg-white bg-opacity-25">
            <h2 class="font-bold text-5xl pt-2 md:pt-4 md:px-2
                bg-gradient-to-r from-gray-700 via-gray-900 to-black
                bg-clip-text text-transparent w-fit">
                <Tide class="w-48 h-48 -mb-12" />
                Accès à Tide
            </h2>
            {
                // Si l'utilisateur a un token de connection.
                conn.value?.connection?.connection.token
                ? <div class="flex flex-col gap-1">
                    <span>
                        Vous êtes connecté
                    </span>
                    <Link class="text-black text-opacity-50 cursor-pointer select-none
                        hover:text-opacity-75 transition-colors w-fit"
                        href="/api/deconnexion" prefetch={false}>
                        déconnexion
                    </Link>
                </div>
                : <>
                    <label class="relative group">
                        <span class={["absolute transition-all",
                            data.email.length === 0 
                            ? 'top-2 left-4 text-lg font-light' 
                            : '-top-3 left-3 text-sm font-medium',
                            "group-focus-within:-top-3 group-focus-within:left-3 group-focus-within:text-sm",
                            "group-focus-within:font-medium cursor-text"]}>
                            Adresse email
                        </span>
                        <input onInput$={(_, t) => data.email = t.value}
                            name="email" type="email" class="px-4 py-2 rounded bg-black bg-opacity-5 w-fit 
                            outline-none text-lg" />
                    </label>
                    <label class="relative group">
                        <span class={["absolute transition-all",
                        data.pass.length === 0 
                        ? 'top-2 left-4 text-lg font-light' 
                        : '-top-3 left-3 text-sm font-medium',
                        "group-focus-within:-top-3 group-focus-within:left-3 group-focus-within:text-sm",
                        "group-focus-within:font-medium cursor-text"]}>
                            Mots de passe
                        </span>
                        <input class="px-4 py-2 rounded bg-black bg-opacity-5 w-fit 
                            outline-none text-lg"
                            onInput$={(_, t) => data.pass = t.value} 
                            name="password" type="password"  />
                    </label>
                </>
            }
        
            <div class="flex flex-row gap-5">
                <div class="px-2.5 py-1 rounded 
                    bg-black bg-opacity-5 w-fit hover:bg-blue-500
                    outline-none text-xl font-bold hover:bg-opacity-25 
                    transition-colors cursor-pointer select-none h-fit"
                    onClick$={async () => {
                        if(!conn.value) {
                            data.errors = 'Not connected to the database';
                            return
                        }
            
                        if(conn.value?.connection?.connection.token) {
                            nav('/dash');
                            return;
                        }
            
                        try {
                            const token = await conn.value.signin({
                                access: 'responsables',
                                variables: {
                                    email: data.email,
                                    password: data.pass
                                }
                                
                            })
                            localStorage.setItem('token', token);
                            localStorage.setItem('email', data.email);
                            nav('/dash')
                        } catch {
                            data.errors = 'Identifiants incorrectes.'
                        }
            
                    }}>
                    Accéder
                </div>
                <div class={["p-2 bg-red-300 bg-opacity-50 border-2 border-red-400 rounded", 
                    data.errors.length > 0 ? 'block' : 'hidden']}>
                    {
                        data.errors
                    }
                </div>
                <Link class="text-sm font-light cursor-pointer select-none h-fit w-fit
                    hover:text-black hover:text-opacity-25 transition-colors"
                    href="/">
                    Accéder à la documentation
                </Link>
            </div>
        </Form>
    </section>;
});

export const head: DocumentHead = {
    title: "Tidee - Connexion",
    meta: [
        {
            name: "description",
            content: "Une solution de gestion d'association",
        },
    ],
};
