import {OpenAPIRoute} from "chanfana";
import {AppContext} from "../types";
import {NotifyError} from "../errors";
import {z} from "zod";
import {bark} from "../service/bark";

export class BarkEndpoint extends OpenAPIRoute {
    schema = {
        tags: ["Notification"],
        summary: "Send a notification via Bark",
        request: {
            params: z.object({
                client: z.string().describe("Bark Key"),
            }),
            query: z.object({
                title: z.string().optional().default("Server Notify"),
                content: z.string().optional(),
                badge: z.coerce.number().optional(),
                sound: z.string().optional(),
                icon: z.string().optional(),
                group: z.string().optional(),
                url: z.string().optional(),
            }),
        }
    };

    async handle(c: AppContext) {
        const data = await this.getValidatedData<typeof this.schema>();
        const { client } = data.params;
        const { title, content, badge, sound, icon, group, url } = data.query;

        try {
            const result = await bark({
                title: title,
                content: content,
                client: client,
                badge: badge,
                sound: sound,
                icon: icon,
                group: group,
                url: url,
            });

            return Response.json({
                success: true,
                result: result,
            });
        } catch (error) {
            if (error instanceof NotifyError) {
                return Response.json({
                    success: false,
                    error: error.message,
                    code: error.code
                }, { status: 400 });
            }
            throw error;
        }
    }
}
