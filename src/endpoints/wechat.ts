import {OpenAPIRoute} from "chanfana";
import {AppContext} from "../types";
import {NotifyError} from "../errors";
import {z} from "zod";
import {wechat} from "../service/wechat";

export class WechatEndpoint extends OpenAPIRoute {
    schema = {
        tags: ["Notification"],
        summary: "Send a notification via WeChat (Server酱)",
        request: {
            params: z.object({
                client: z.string(),
            }),
            query: z.object({
                title: z.string().optional().default("Server Notify"),
                content: z.string().optional(),
            }),
        }
    };

    async handle(c: AppContext) {
        const data = await this.getValidatedData<typeof this.schema>();
        const { client } = data.params;
        const { title, content } = data.query;

        try {
            const result = await wechat({
                title: title,
                content: content,
                client: client,
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