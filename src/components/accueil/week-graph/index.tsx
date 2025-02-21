import { component$, PropsOf } from "@builder.io/qwik";

interface Props extends PropsOf<'div'> {
    objectif: number,
    graph?: WeekGraphProps
}

export const REQUETE_ACTIVITE_HEBDO = `
    SELECT 
        pole.meta.couleur AS couleur,
        pole.nom AS nom,
        date,
        math::mean(
            array::map(heures, |$v| $v.heures)
        ) AS moyenne
    FROM appels
    ORDER BY date DESC
    LIMIT 100;`
export type ActiviteHebdo = {
    couleur: string | null,
    nom: string,
    date: string,
    moyenne: number
}

export const responseToWeekGraph = (activites: ActiviteHebdo[]): WeekGraphProps => {
    const graph: WeekGraphProps = {
        dates: [],
        moyennes: {},
        couleurs: {}
    }

    // Set => array sans duplicata
    const nom_poles: Set<string> = new Set()
    const data: { [date: string]: { [pole: string]: number } } = {};
    
    // On transforme les données de liste à objet.
    activites.forEach(activite => {
        nom_poles.add(activite.nom)
        if(!(activite.nom in graph.couleurs)) {
            graph.couleurs[activite.nom] = activite.couleur
        }

        if(activite.date in data) {
            data[activite.date][activite.nom] = activite.moyenne;
        } else {
            data[activite.date] = {};
            data[activite.date][activite.nom] = activite.moyenne;
        }
    });

    Object.entries(data)
        .sort((a, b) => {
            const date_a = new Date(a[0])
            const date_b = new Date(b[0])
            return date_a.getTime() - date_b.getTime()
        })
        .forEach(([date, poles]) => {
        // On remplit de null les poles qui n'ont pas eu de données jusqu'à là.
        nom_poles.forEach(pole => {
            if(!(pole in graph.moyennes)) {
                graph.moyennes[pole] = []
            }
            while(graph.moyennes[pole].length < graph.dates.length) {
                // null => pas de données pour cette date
                graph.moyennes[pole].push(null) 
            }
        })

        graph.dates.push(date)
        // On ajoute les données pour cette date
        Object.entries(poles).forEach(([pole, moyenne]) => {
            graph.moyennes[pole].push(moyenne);
        })
    })

    // On transforme les dates MM/JJ/AAAA en dates de toutes lettres (jour mois. année)
    graph.dates.forEach((date, i) => {
        graph.dates[i] = new Date(date).toLocaleDateString('fr-FR', {
            dateStyle: 'medium'
        })
    })

    return graph
}

export interface WeekGraphProps {
    dates: string[]
    moyennes: { [pole: string]: (number | null)[] },
    couleurs: { [pole: string]: string | null }
}

import "./style.css"
export default component$(({ graph, objectif, ...props }: Props) => {
    if(!graph) {
        return <div class="animate-pulse">chargement</div>
    }

    return <div {...props} class={["px-5 py-4 w-full h-full border rounded graphique overflow-hidden", props.class && props.class]} style={{
        '--colonnes': graph.dates.length
    }}>
        <h3 class="text-sm font-normal text-black text-opacity-50 mb-2">
            Activités hebdomadaires par pôle
        </h3>
        {
            Object
                .keys(graph.moyennes)
                .map(pole => <div class="ligne" key={pole}>
                <div class="text-right pr-1 capitalize">{pole}</div>
                {
                    graph.moyennes[pole].map((moyenne, i) => 
                        moyenne === null 
                        // Pas de données => case grisée
                        ? <div
                            key={i}
                            title={"Pas de données pour "+ graph.dates[i]}
                            class="point bg-gray-700 opacity-25"/>
                        // Case d'une opacite correspondant à l'activite
                        : <div 
                            key={i}
                            title={graph.dates[i]}
                            class="point"
                            style={{ 
                                opacity: moyenne / objectif, 
                                backgroundColor: graph.couleurs[pole] || '#15803d'
                            }} />)
                }
            </div>)
        }
    </div>
})