import { component$, PropsOf, QRL, Slot } from "@builder.io/qwik";
import { LuChevronDown, LuChevronUp } from "@qwikest/icons/lucide";

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
                                    {
                                        trie[1] == 'asc'
                                        ? <LuChevronUp/>
                                        : <LuChevronDown/>
                                    }
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
        <td>
            {
                ligne[3]
            }h
        </td>
        <td>
            {
                ligne[4]
            }
        </td>
        <td>
            {
                ligne[5]
            }
        </td>
</tr>
}) 