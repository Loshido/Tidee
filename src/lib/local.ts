import { createStorage } from "unstorage";
import localStorageDriver from "unstorage/drivers/localstorage";

const storage = createStorage({
    driver: localStorageDriver({ base: ".:" }),
});

export default storage;

type Callback<T> = () => Promise<T>
// Mise en cache
export async function cache<T>(key: string, ttl: number, callback: Callback<T>): Promise<T> {
    const data = await storage.getItem<[T, number]>(key);
    if(data && Date.now() < data[1]) {
        return data[0];
    } else {
        const payload =  await callback();
        await storage.setItem(key, [payload, Date.now() + ttl * 1000])
        return payload;
    }
}