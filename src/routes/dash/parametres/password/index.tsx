import { component$, useContext, useStore } from "@builder.io/qwik";
import { type DocumentHead, Link } from "@builder.io/qwik-city";
import Entree from "~/components/admin/entree";
import { connectionCtx, notificationsCtx } from "~/routes/layout";

export default component$(() => {
    const notifications = useContext(notificationsCtx);
    const conn = useContext(connectionCtx);
    const data = useStore({
        old: "",
        new: "",
        confirmation: ""
    })

    return <section class="p-5">
        <Link class="px-3 py-1 bg-black/10 hover:bg-black/5 cursor-pointer select-none transition-colors"
            href="/dash/parametres/">
            Revenir
        </Link>
        <div class="w-full h-full flex flex-col py-8 px-4 gap-4">
            <h2 class="font-medium">
                Changez votre mots de passe.
            </h2>
            <Entree
                autoComplete="current-password"
                required
                onInput$={(_, t) => data.old = t.value}
                type="password"
                name="Mots de passe actuel"/>
            <Entree
                autoComplete="new-password"
                required
                onInput$={(_, t) => data.new = t.value}
                type="password"
                name="Nouveau mots de passe"/>
            <Entree
                autoComplete="new-password"
                required
                onInput$={(_, t) => data.confirmation = t.value}
                class={data.confirmation !== data.new 
                    ? 'border-b-2 border-red-600 border-dotted' 
                    : ''}
                type="password"
                name="Confirmation"/>
            <div class="px-3 py-1 bg-violet-600 text-white hover:bg-violet-400
                cursor-pointer select-none transition-colors w-fit" 
                onClick$={async () => {
                    if(data.old.length === 0 || data.new.length === 0) {
                        notifications.push({
                            contenu: "C'est mieux avec le mots de passe...",
                            duration: 2
                        })
                        return;
                    } else if(data.new !== data.confirmation) {
                        notifications.push({
                            contenu: "Les deux mots de passe ne correspondent pas.",
                            duration: 3
                        })
                        return;
                    } else if(!conn.value) {
                        notifications.push({
                            contenu: "Pas d'accès à la base de données.",
                            duration: 3
                        })
                        return;
                    }

                    const [success] = await conn.value.query<[boolean]>(
                        `IF crypto::argon2::compare($session.rd.pass, $old) THEN {
                            UPDATE membres SET pass = crypto::argon2::generate($new) WHERE id = $session.rd; 
                            RETURN true
                        } ELSE false
                        END;`, {
                            old: data.old,
                            new: data.new
                        }
                    );
                    notifications.push({
                        contenu: success
                            ? "Mots de passe mis à jours avec succès"
                            : "Mots de passe incorrecte",
                        duration: 3
                    })
                }}>
                Changer de mots de passe
            </div>
        </div>
    </section>
})

export const head: DocumentHead = {
    title: "Tidee - Mots de passe",
    meta: [
        {
            name: "description",
            content: "Une solution de gestion d'association",
        },
    ],
};