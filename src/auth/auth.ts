import {Context} from "hono";

export async function bearer(token: string, c: Context): Promise<boolean> {
    return token === c.env.SERVICE_TOKEN;
}