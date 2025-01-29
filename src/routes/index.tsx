import { $, component$, Slot, useContext, useStore } from "@builder.io/qwik";
import { Form, Link, LinkProps, useNavigate, type DocumentHead } from "@builder.io/qwik-city";

import Tide from "~/assets/tide_logo.png?jsx"
import FlowField from "~/components/utils/FlowField";
import { connectionCtx, notificationsCtx } from "./layout";

export const Lien = component$((props: LinkProps) => <Link {...props}
    class="text-sm font-light cursor-pointer select-none h-fit w-fit
        hover:text-black hover:text-opacity-25 transition-colors">
    <Slot/>
</Link>)

export default component$(() => {
    const nav = useNavigate()
    const data = useStore({
        email: '',
        pass: '',
    })

    const conn = useContext(connectionCtx);
    const notifications = useContext(notificationsCtx);

    const submit = $(async () => {
        if(!conn.value) {
            notifications.push({
                contenu: 'La base de données est inaccessible',
                duration: 5
            })
            return
        }

        if(conn.value.connection?.connection.token) {
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
            notifications.push({
                contenu: 'Identifiants correctes.',
                duration: 3
            })
            localStorage.setItem('token', token);
            localStorage.setItem('email', data.email);
            nav('/dash')
        } catch {
            notifications.push({
                contenu: 'Identifiants incorrectes.',
                style: 'border-red-600 bg-white',
                progress_style: 'bg-red-600 bg-opacity-100',
                duration: 5
            })
        }
    })

    return <section class="flex md:grid flex-col md:items-center gap-2 sm:gap-10 
        p-5 md:p-10 w-svw h-svh
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
                <Tide class="w-24 h-24 sm:w-48 sm:h-48 sm:-mb-12" />
                Accès à Tidee
            </h2>
            {
                // Si l'utilisateur a un token de connection.
                conn.value?.connection?.connection.token
                ? <div class="flex flex-col gap-1 border rounded p-3">
                    <span class="font-semibold">
                        Vous êtes déjà connecté
                    </span>
                    <Lien href="/deconnexion">
                        Déconnexion
                    </Lien>
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
        
            <div class="px-2.5 py-1 rounded 
                bg-black bg-opacity-5 w-fit hover:bg-blue-500
                outline-none text-xl font-bold hover:bg-opacity-25 
                transition-colors cursor-pointer select-none h-fit"
                onClick$={submit}>
                Accéder
            </div>
            <div class="flex flex-col gap-1 p-1">
                <Lien href="/etc/password-reset/">
                    Mots de passe oublié
                </Lien>
                <Lien href="https://github.com/Loshido/Tidee/issues/new" target="_blank">
                    Ouvrir un ticket
                </Lien>
                <Lien href="/">
                    Accéder à la documentation
                </Lien>
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
