import { createStorage } from "unstorage";
import memoryDriver from "unstorage/drivers/memory";

const storage = createStorage({
    driver: memoryDriver(),
});

// acts like a cache layer
export default storage;

type Callback<T> = (cache: (data: T) => Promise<void>) => Promise<T>
// Mets en cache si le ttl est dépassé sinon renvoie la valeur.
export async function cache<T>(key: string, ttl: number, callback: Callback<T>): Promise<T> {
    const cached = await storage.getItem<[T, number]>(key);
    
    // Si l'élement est présent dans le cache 
    // et dépasse pas le TTL, on le renvoie
    if(cached && Date.now() < cached[1]) {
        return cached[0];
    }

    return await callback(async (data) => {
        await storage.setItem(key, [data, Date.now() + ttl]);
    })
}