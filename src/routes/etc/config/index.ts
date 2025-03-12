import { RequestHandler } from "@builder.io/qwik-city";
import fs from "fs";

export const onGet: RequestHandler = (requestEvent) => {
    requestEvent.cacheControl('day');
    const path = requestEvent.env.get('CONFIG_PATH') || './data/config.json'
    
    const config = fs.readFileSync(path, {
        encoding: 'utf-8'
    });

    requestEvent.headers.set('Content-Type', 'application/json');
    requestEvent.send(200, config);
}