import { component$ } from "@builder.io/qwik";



interface Props {
    poles: {
        [key: string]: {
            couleur?: string,
            activite: (number | null)[]
        },
    },
    dates: string[]
}

import "./style.css"
export default component$(({ poles, dates }: Props) => {

    return <div class="px-5 py-4 w-fit h-full border rounded graphique" style={{
        '--colonnes': dates.length
    }}>
        <h3 class="text-sm font-normal text-black text-opacity-50 mb-2">
            Activités hebdomadaires par pôle
        </h3>
        {
            Object
                .keys(poles)
                .map(pole => <div class="ligne" key={pole}>
                <div class="text-right pr-1 capitalize">{pole}</div>
                {
                    poles[pole].activite.map((v, i) => 
                        v === null 
                        ? <div
                            key={i}
                            title={"Pas de données pour "+ dates[i]}
                            class="point bg-gray-700 opacity-25"/>
                        : <div 
                            key={i}
                            title={dates[i]}
                            class="point"
                            style={{ 
                                opacity: v, 
                                backgroundColor: poles[pole].couleur || '#15803d'
                            }} />)
                }
            </div>)
        }
    </div>
})