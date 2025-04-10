/*
    * WHAT IS THIS FILE?
    *
    * It's the entry point for the Bun HTTP server when building for production.
    *
    * Learn more about the Bun integration here:
    * - https://qwik.dev/docs/deployments/bun/
    * - https://bun.sh/docs/api/http
    *
    */

import { createQwikCity } from "@builder.io/qwik-city/middleware/bun";
import qwikCityPlan from "@qwik-city-plan";
import { manifest } from "@qwik-client-manifest";
import render from "./entry.ssr";

// Create the Qwik City Bun middleware
const { router, notFound, staticFile } = createQwikCity({
    render,
    qwikCityPlan,
    manifest,
});

const port = Number(Bun.env.PORT ?? 80);

// eslint-disable-next-line no-console
console.log(`Started at http://localhost:${port}/`);

const app = Bun.serve({
    reusePort: true,
    async fetch(request: Request) {
        const staticResponse = await staticFile(request);
        if (staticResponse) return staticResponse;

        const qwikCityResponse = await router(request);
        if (qwikCityResponse) return qwikCityResponse;

        return notFound(request);
    },
    port,
});

const shutdown = async () => {
    await app.stop(true)
}

process.addListener('SIGKILL', shutdown);
process.addListener('SIGTERM', shutdown);
process.addListener('exit', shutdown);