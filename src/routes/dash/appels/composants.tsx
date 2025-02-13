import { component$, type QRL, Slot } from "@builder.io/qwik"
import { LuChevronDown, LuChevronUp } from "@qwikest/icons/lucide"
import type { EnteteProps, MembreAppel } from "./types"

// Entete du tableau pour les colonnes triables
export const Entete = component$(({ trie, colonne }: EnteteProps) => {
    return <div class="flex flex-row" onClick$={() => trie.change(colonne)}>
        <Slot/>
        {
            trie.colonne === colonne
            ? (
                trie.direction == 'asc'
                ? <LuChevronUp/>
                : <LuChevronDown/>

            ) : null
        }
    </div>
})

type LigneProps = {
    membre: MembreAppel,
    plus: QRL<(id: string) => void>,
    minus: QRL<(id: string) => void>
}

export const Ligne = component$(({ membre, plus, minus }: LigneProps)=> <div class="ligne">
    <div>
        {
            membre.nom
        }
    </div>
    <div>
        {
            membre.prenom
        }
    </div>
    <div>
        <span>
            {membre.heures}h 
        </span>
        {
            membre.heures_sup == 0
            ? null
            : (
                membre.heures_sup >= 0 
                ? <span 
                    class="text-green-600 font-semibold"> +{membre.heures_sup}</span>
                : <span 
                    class="text-red-600 font-semibold"> {membre.heures_sup}</span>
            )
        }
    </div>
    <div class="cube" onClick$={async () => await plus(membre.id)}>
        +
    </div>
    <div class="cube" onClick$={async () => await minus(membre.id)}>
        -
    </div>
</div>)