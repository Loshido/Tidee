import { LinkProps } from "@builder.io/qwik-city";
import { RecordId } from "surrealdb";
declare global {
    type Pole = {
        id: RecordId,
        nom: string,
        poles: RecordId[]
        responsables: RecordId[],
        permissions: RecordId[],
        meta: {
            images?: {
                // De cette façon, on peut afficher une image pour chaque appareil
                // media-query: image-url
                [key: string]: string,

                // L'image servie par défaut
                default: string
            },
            // description (rendu en html)
            description: string,
            // on pourra utiliser .pole-container-[nom du pole en minuscule]
            // pour toucher le conteneur de la page du pôle
            style?: string,

            boutons: (
                LinkProps & { slot: string}
            )[]
        }
    }
    
    type Membre = {
        id: RecordId,
        email: string,
        heures: number,
        
        nom: string,
        prenom: string,
        // pass: string, // should be protected by SurrealDB
        poles: string[],
        promotion: string,
        permissions: RecordId[]
    }

    type AppelData = {
        id: RecordId,
        heures: number,
        before: number
    }

    
    type Session = {
        ac: string,
        db: string,
        exp: unknown,
        id: string,
        ip: string

        ns: string // namespace
        or: string, // origin
        rd: RecordId | null // user 
        tk: null | {
            ac: string,
            db: string,
            ns: string,
            id: RecordId,

            exp: number,
            iat: number,
            iss: string,
            jti: string,
            nbf: number
        }
    }
}