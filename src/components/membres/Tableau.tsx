import { component$, type PropsOf, type QRL, Slot, useContext } from "@builder.io/qwik";
import { LuChevronUp } from "@qwikest/icons/lucide";
import { configCtx } from "~/routes/layout";

type PropsTableau = {
    trier: QRL<(colonne: string) => void>,
    trie: [string, 'asc' | 'desc']
}

type Colonne = {
    name: string,
    label: string,
    triable: boolean
}

const COLONNES: Colonne[] = [
    {
        name: 'nom',
        label: 'Nom',
        triable: true
    },
    {
        name: 'prenom',
        label: 'Prénom',
        triable: true
    },
    {
        name: 'heures',
        label: 'Heures',
        triable: true
    },
    {
        name: 'poles',
        label: 'Poles',
        triable: false
    },
    {
        name: 'promotion',
        label: 'Promotion',
        triable: true
    }
]

export default component$(({ trier, trie }: PropsTableau) => {
    return <table class="mt-4 text-sm w-full" id="membres">
        <thead class="font-semibold">
            <tr class="*:cursor-pointer select-none">
                {
                    COLONNES.map(colonne => <th
                        data-disabled={colonne.triable ? 'false' : 'true'}
                        key={colonne.name}
                        onClick$={async () => {
                            if(!colonne.triable) return;
                            await trier(colonne.name);
                        }}>
                        <div>
                            {
                                colonne.label
                            }
                            {
                                trie[0] === colonne.name
                                ? <>
                                    <LuChevronUp class={trie[1] == 'asc' 
                                        ? 'transition-transform' 
                                        : 'rotate-180 transition-transform'}/>
                                </>
                                : null
                            }
                        </div>
                    </th>)
                }
            </tr>
        </thead>
        <tbody>
            <Slot/>
        </tbody>
    </table>
})


type Ligne = {
    // id, nom, prenom, heure, pole, promotion
    ligne: [string, string, string, number, string, string]
};
export const Ligne = component$(({ ligne, ...props }: Ligne & PropsOf<'tr'>) => {
    const config = useContext(configCtx)
    return <tr {...props} key={ligne[0]}>
        <td>
            {
                ligne[1]
            }
        </td>
        <td>
            {
                ligne[2]
            }
        </td>
        <td style={{
            color: ligne[3] >= 70 ? '#28A501' : '',
            fontWeight: ligne[3] >= 70 ? 700 : 500
        }}>
            {
                ligne[3]
            }h
        </td>
        <td>
            {
                ligne[4].split(', ').map((pole, i, a) => <span key={i}>
                    <span style={{
                        fontWeight: 900,
                        color: config.poles && pole in config.poles
                            ? config.poles[pole]
                            : ''
                    }}>
                        {pole}
                    </span>
                    {
                        i == a.length - 1
                        ? ''
                        : ', '
                    }
                </span>)
            }
        </td>
        <td style={{
            fontWeight: 900,
            color: config.promotions && ligne[5] in config.promotions 
                ? config.promotions[ligne[5]] 
                : '',
            backgroundColor: config.promotions && ligne[5] in config.promotions
                ? 'white'
                : ''
        }}>
            {
                ligne[5]
            }
        </td>
</tr>
}) 