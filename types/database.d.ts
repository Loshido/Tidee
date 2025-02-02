import { RecordId } from "surrealdb";
declare global {
    type Pole = {
        id: RecordId,
        nom: string,
        poles: RecordId[]
        responsables: RecordId[]   
    }
    
    type Membre = {
        id: RecordId,
        email: string,
        heures: number,
        
        nom: string,
        prenom: string,
        // pass: string, // should be protected by SurrealDB
        poles: string,
        promotion: string
    }
    
    interface Session {
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