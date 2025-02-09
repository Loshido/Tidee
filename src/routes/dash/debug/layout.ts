import { isDev } from "@builder.io/qwik";
import { RequestHandler } from "@builder.io/qwik-city/middleware/request-handler";

export const onRequest: RequestHandler = (req) => {
    if(!isDev) throw req.redirect(302, '/dash')
}