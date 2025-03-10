import { RequestHandler } from "@builder.io/qwik-city";
import fs from "fs";

export const onGet: RequestHandler = (requestEvent) => {
    requestEvent.cacheControl('day');
    
    const config = fs.readFileSync('./data/config.json', {
        encoding: 'utf-8'
    });

    requestEvent.headers.set('Content-Type', 'application/json');
    requestEvent.send(200, config);
}