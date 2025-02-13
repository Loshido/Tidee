import type { QRL } from "@builder.io/qwik"
import type { RecordId } from "surrealdb"
import type { SerializableMembre } from "~/components/membres/utils"

export interface AppelState {
    pole?: string,
    poles: {
        id: string,
        nom: string,
        style?: string
    }[],
    date: Date,
    trie: Colonnes | null,
    trie_direction: 'asc' | 'desc',
    synced: boolean,
    last_sent: number
}

export type Pole = {
    id: RecordId,
    nom: string
}

export type Colonnes = 'nom' | 'prenom' | 'heures'

export type MembreAppel = SerializableMembre & {
    heures_sup: number
}

export type EnteteProps = {
    colonne: Colonnes,
    trie: {
        change: QRL<(colonne: Colonnes) => void>
        colonne: string,
        direction: string
    }
}