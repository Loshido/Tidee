import { RecordId } from "surrealdb";

export type Responsable = {
    id: RecordId,
    nom: string,
    prenom: string
}

export type RequetePoles = Omit<Pole, 'responsables'> & {
    responsables: Responsable[]
}
export type SerializablePoles = {
    id: string,
    nom: string,
    poles: string[],
    responsables: {
        id: string,
        nom: string,
        prenom: string
    }[],
    permissions: string[]
};