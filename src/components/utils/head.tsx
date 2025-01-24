import { component$ } from "@builder.io/qwik";
import { useDocumentHead, useLocation } from "@builder.io/qwik-city";

// Ce composant corresponds aux tags que l'on met dans la balise <head> de chaque page.
export const RouterHead = component$(() => {
    const head = useDocumentHead();
    const loc = useLocation();

    return <>
        <title>{head.title}</title>

        <link rel="canonical" href={loc.url.href} />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />

        {
            // Meta données
            head.meta.map(m => 
                <meta key={m.key} {...m} />)
        }

        {   // Liens (styles css, ...)
            head.links.map(l => 
                <link key={l.key} {...l}/>)
        }

        {   // Balises de style
            head.styles.map(s => 
                <style
                    key={s.key}
                    {...s.props}
                    {...(s.props?.dangerouslySetInnerHTML
                        ? {}
                        : { dangerouslySetInnerHTML: s.style })}
                    />)
        }

        {
            head.scripts.map(s => 
                <script
                    key={s.key}
                    {...s.props}
                    {...(s.props?.dangerouslySetInnerHTML
                    ? {}
                    : { dangerouslySetInnerHTML: s.script })}
                />)
        }
    </>;
});
