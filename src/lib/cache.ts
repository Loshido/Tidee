import destr from "destr";
import { createCache } from "qwache";
import config from "./config";

const cache = createCache({
    async get<T>(id: string) {
        const item = localStorage.getItem(`.:` + id)
        return destr<T>(item)
    },
    async set<T>(id: string, data: T) {
        localStorage.setItem(`.:` + id, JSON.stringify(data));
    },
    async list() {
        const keys: string[] = [];

        for(let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i)
            if(key && key.startsWith('.:')) {
                keys.push(key);
            }
        }
        return keys;
    }
})

export default async <T>(id: string, callback: () => Promise<T>, ttl: number = 1000 * 60 * 5): Promise<T> => {
    const conf = await config();
    
    if(id in conf.cacheExpiration) {
        // @ts-ignore
        return await cache(id, callback, conf.cacheExpiration[id]);
    }
    return await cache(id, callback, ttl);
}