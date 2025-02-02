// a Query Build Class

import type Surreal from "surrealdb";

export const selectPoles = async (conn: Surreal): Promise<string[]> => {
    // On prends les noms de tous les pôles.
    // <=> SELECT DISTINCT nom FROM poles
    const query = "SELECT array::group(nom) AS noms FROM poles GROUP ALL;";
    const response = await conn.query<[{ noms: string[] }[]]>(query)
    // On fait une liste des noms qu'on a récupéré.
    return response[0][0].noms
}

export const selectPromotions = async (conn: Surreal): Promise<string[]> => {
    // <=> SELECT DISTINCT promotion FROM membres
    const query = "SELECT array::group(promotion) AS promotion FROM membres GROUP ALL";
    const response = await conn.query<[{ promotion: string[] }[]]>(query);

    return response[0][0].promotion;
}


type Filtre = {
    poles: string[], 
    promotions: string[], 
    search: string
}

export class SelectQuery {
    poles: string[] = []
    promotions: string[] = []
    search: string = ''
    variables: {
        poles?: string[],
        search?: string
    } = {}
    _query: string
    table: string
    columns: string
    
    _default() {
        return `SELECT ${this.columns} FROM ${this.table}`
    }

    _poles() {
        if(this.poles.length == 0) {
            delete this.variables.poles;
            return ''
        }

        this.variables.poles = this.poles
        return `array::map(poles, |$v| $v.nom) ANYINSIDE $poles`

        // array::map(poles, |$v| $v.nom) -> ['Serveur', 'Bureau']
        // On mets les poles du membre dans un array

        // [${poles}] -> ['Serveur', 'Pole', ...] 
        // Il s'agit des pôles que l'on a mis en filtre.

        // ANYINSIDE vérifie s'il y a une intersection entre les deux arrays
    }

    _promotions() {
        if(this.promotions.length == 0) {
            return ''
        }

        // On prends tous les membres étant dans l'une des promotions données
        const promotions = this.promotions
            .map(p => `promotion == '${p}'`)
            .join(' OR ');
        return `(${promotions})`

        // ex: (promotion == 'CIN1' OR promotion == 'CIN2' OR ...)
    }

    _search() {
        if(this.search.length == 0) {
            delete this.variables.search;
            return ''
        }

        // On cherche les entrées qui correspondent à la recherche.
        // par souci de performance, on va juste rechercher sur les colonnes prénom et nom.

        this.variables.search = this.search.toLowerCase();
        const nom = `string::contains(string::lowercase(nom), $search)`;
        const prenom = `string::contains(string::lowercase(prenom), $search)`;

        return `(${nom} OR ${prenom})`
    }
    
    constructor(columns: string, table: string) {
        this.columns = columns;
        this.table = table;

        this._query = this._default();
    }

    reinitialiser() {
        this.variables = {};
        this.poles = []
        this.promotions = []
        this.search = ''
    }

    applique(filter: Partial<Filtre>) {
        let q = this._default();
        if(filter.poles) this.poles = filter.poles;
        if(filter.promotions) this.promotions = filter.promotions;
        if(filter.search !== undefined) this.search = filter.search;

        const filters = [this._search(), this._poles(), this._promotions()].filter(f => f.length > 0);
        if(filters.length === 0) {
            this._query = q;
            return;
        }

        q += ' WHERE ' + filters.join(' AND ')

        this._query = q;
    }

    query(): [string, {
        poles?: string[],
        search?: string
    }] {
        const query = this._query + ' ORDER BY nom;'
        console.log(query)
        return [query, this.variables];
    }
}