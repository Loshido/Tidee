import type { RecordId } from "surrealdb"

export type Membres = [{
    id: RecordId,
    nom: string,
    prenom: string
}[]]

export type Membre = {
    id: RecordId
    nom: string,
    prenom: string,
    heures: number,
    email: string,
    promotion: string,
    permissions: RecordId[],
    poles: RecordId[],
}
export type Utilisateur = Omit<Membre, 'permissions' | 'poles' | 'id'> & {
    permissions: string[],
    poles: string[],
    id: string
}