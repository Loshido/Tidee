import defu from "defu";

interface Config {
    cacheExpiration: {
        membres: number,
        poles: number,
        accueil: number,
        filtres: number
    }
}

const defaultConfig: Config = {
    cacheExpiration: {
        membres: 60 * 60 * 1000, // 1 heure,
        poles: 2 * 60 * 60 * 1000, // 2 heures
        accueil: 12 * 60 * 60 * 1000, // 12 heures
        filtres: 24 * 60 * 60 * 1000 // 24 heures
    }
}

export default async (): Promise<Config> => {
    const payload = await fetch('/etc/config', {
        method: 'GET',
    })

    if(payload.status == 200) {
        try {
            const config = await payload.json();
            return defu(config, defaultConfig);
        } catch(error) {
            console.error(error)
        }
    }
    
    return defaultConfig;
}