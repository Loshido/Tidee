import { component$, useStore, useTask$ } from "@builder.io/qwik";

interface Props {
    objectif: number,
    activites: ActiviteHebdo[]
}

export const REQUETE_ACTIVITE_HEBDO = `
SELECT 
    pole.nom AS nom,
    date,
    math::mean(
        array::map(heures, |$v| $v.heures)
    ) AS moyenne
FROM appels;
`
export type ActiviteHebdo = {
    nom: string,
    date: string,
    moyenne: number
}

import "./style.css"
export default component$(({ activites, objectif }: Props) => {
    const dates = useStore<string[]>([])
    const moyennes_poles = useStore<{ [key: string]: (number | null)[] }>({})


    useTask$(({ track }) => {
        track(activites)
        // Set => array sans duplicata
        const nom_poles: Set<string> = new Set()
        const data: { [date: string]: { [pole: string]: number } } = {};
        
        // On transforme les données de liste à objet.
        activites.forEach(activite => {
            nom_poles.add(activite.nom)
            if(activite.date in data) {
                data[activite.date][activite.nom] = activite.moyenne;
            } else {
                data[activite.date] = {};
                data[activite.date][activite.nom] = activite.moyenne;
            }
        });

        Object.entries(data).forEach(([date, poles]) => {
            // On remplit de null les poles qui n'ont pas eu de données jusqu'à là.
            nom_poles.forEach(pole => {
                if(!(pole in moyennes_poles)) {
                    moyennes_poles[pole] = []
                }
                while(moyennes_poles[pole].length < dates.length) {
                    // null => pas de données pour cette date
                    moyennes_poles[pole].push(null) 
                }
            })

            dates.push(date)
            // On ajoute les données pour cette date
            Object.entries(poles).forEach(([pole, moyenne]) => {
                moyennes_poles[pole].push(moyenne);
            })
        })

        // On transforme les dates MM/JJ/AAAA en dates de toutes lettres (jour mois. année)
        dates.forEach((date, i) => {
            dates[i] = new Date(date).toLocaleDateString('fr-FR', {
                dateStyle: 'medium'
            })
        })
    })

    return <div class="px-5 py-4 w-fit h-full border rounded graphique" style={{
        '--colonnes': dates.length
    }}>
        <h3 class="text-sm font-normal text-black text-opacity-50 mb-2">
            Activités hebdomadaires par pôle
        </h3>
        {
            Object
                .keys(moyennes_poles)
                .map(pole => <div class="ligne" key={pole}>
                <div class="text-right pr-1 capitalize">{pole}</div>
                {
                    moyennes_poles[pole].map((moyenne, i) => 
                        moyenne === null 
                        // Pas de données => case grisée
                        ? <div
                            key={i}
                            title={"Pas de données pour "+ dates[i]}
                            class="point bg-gray-700 opacity-25"/>
                        // Case d'une opacite correspondant à l'activite
                        : <div 
                            key={i}
                            title={dates[i]}
                            class="point"
                            style={{ 
                                opacity: moyenne / objectif, 
                                backgroundColor: '#15803d'
                            }} />)
                }
            </div>)
        }
    </div>
})