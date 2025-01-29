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
}