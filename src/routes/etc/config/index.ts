import { RequestHandler } from "@builder.io/qwik-city";
import { createCache } from "qwache";
import fs from "fs";
import destr from "destr";

const cache = createCache();
export const onGet: RequestHandler = async (requestEvent) => {
    requestEvent.cacheControl('day');
    const config =  await cache('config', async () => {
        const path = requestEvent.env.get('CONFIG_PATH') || './data/config.json'
        
        try {
            const config = fs.readFileSync(path, {
                encoding: 'utf-8'
            });
        
            return destr(config)
        } catch(e) {
            console.error(e)
            return {}
        }
    }, 1000 * 60 * 60 * 24)

    requestEvent.json(200, config)
}