import defu from "defu";

export interface Config {
    cacheExpiration: {
        membres: number,
        poles: number,
        accueil: number,
        filtres: number
    },
    // couleurs promotions affichées
    promotions: {
        [promotion: string]: string
    },
    // couleurs pôles affichées pour les pôles
    poles: {
        [pole: string]: string,
    }
}

const defaultConfig: Config = {
    cacheExpiration: {
        membres: 60 * 60, // 1 heure,
        poles: 2 * 60 * 60, // 2 heures
        accueil: 12 * 60 * 60, // 12 heures
        filtres: 24 * 60 * 60 // 24 heures
    },
    // couleurs des promotions
    promotions: {
        // ISENx, CINx et Mx

        'CIN1': '#F32132',
        'ISEN1': '#F32132',
        'CIN2': '#DC255A',
        'ISEN2': '#DC255A',
        'CIN3': '#C42881',
        'ISEN3': '#C42881',
        'ISEN4': '#AD2CA9',
        'M1': '#AD2CA9',
        'ISEN5': '#952FD0',
        'M2': '#952FD0',

        // 
        'BIOST1': '#596F62',
        'BIOST2': '#3B5053'
    },
    poles: {
        'Dev': 'rgb(239, 68, 68)',
        'Cyber': 'rgb(13, 148, 136)',
        'Innovation': 'rgb(56, 189, 248)',
        'Serveur': 'rgb(37, 99, 235)'
    }
}

export default async (): Promise<Config> => {
    const payload = await fetch('/config/', {
        method: 'GET',
    })

    if(payload.status == 200 && payload.headers.get('content-type') === 'application/json') {
        try {
            const config = await payload.json();
            return defu(config, defaultConfig);
        } catch(error) {
            console.error(error)
        }
    }
    
    return defaultConfig;
}