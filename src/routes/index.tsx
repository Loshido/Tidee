import { $, component$, PropsOf, Slot, useContext, useStore } from "@builder.io/qwik";
import { Form, Link, type LinkProps, useNavigate, type DocumentHead } from "@builder.io/qwik-city";

import Tide from "~/assets/tide_logo.png?jsx"
import FlowField from "~/components/utils/FlowField";
import { connectionCtx, notificationsCtx, permissionsCtx } from "./layout";
import { RecordId } from "surrealdb";

export const Lien = component$((props: LinkProps) => <Link {...props}
    class="text-sm font-light cursor-pointer select-none h-fit w-fit
        hover:text-black hover:text-opacity-25 transition-colors">
    <Slot/>
</Link>)

export const Entree = component$(({active, text, ...props}: { active: boolean, text: string } & PropsOf<'input'>) => <label 
    class="relative group">
    <span class={["absolute transition-all",
        active
        ? 'top-2 left-4 text-lg font-light' 
        : '-top-3 left-3 text-sm font-medium',
        "group-focus-within:-top-3 group-focus-within:left-3 group-focus-within:text-sm",
        "group-focus-within:font-medium cursor-text"]}>
       { text }
    </span>
    <input class={["px-4 py-2 rounded bg-black bg-opacity-5 w-fit",
        "outline-none text-lg", props.class && props.class]}
        {...props}  />
</label>)

export default component$(() => {
    const nav = useNavigate()
    const data = useStore({
        email: '',
        pass: '',
    })

    const conn = useContext(connectionCtx);
    const permissions = useContext(permissionsCtx)
    const notifications = useContext(notificationsCtx);

    // QRL executé lorsqu'on tente d'envoier le formulaire
    const submit = $(async () => {
        if(!conn.value) {
            // On écarte les cas qui nous intéressent pas.
            notifications.push({
                contenu: 'La base de données est inaccessible',
                duration: 5
            })
            return;
        }

        // <=> déjà connecté
        if(conn.value.connection?.connection.token) {
            nav('/dash');
            return;
        }

        try {
            // produit une erreur lorsque l'authentification échoue
            const token = await conn.value.signin({
                access: 'membres', // responsables
                variables: {
                    email: data.email,
                    password: data.pass
                }
            })
            // Chargement des permissions de l'utilisateur
            // $session.rd fait référence à l'id de l'utilisateur (rd: RecordId)
            permissions.splice(0, permissions.length)
            const perms = await conn.value!.query<[RecordId[]]>("fn::permissions($session.rd)");
            console.log(perms)
            permissions.push(...perms[0].map(perm => perm.id.toString()))

            notifications.push({
                contenu: 'Connecté(e) pour 4h',
                duration: 3
            })
            // On stocke le token pour pouvoir le réutiliser dans les 4h
            localStorage.setItem('token', token);
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
                    <Entree
                        active={data.email.length === 0}
                        onInput$={(_, t) => data.email = t.value}
                        name="email" type="email" text="Adresse email"/>
                    <Entree active={data.pass.length === 0}
                        text="Mots de passe" onInput$={(_, t) => data.pass = t.value} 
                        name="password" type="password" />
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