import {OpenAPIRoute} from "chanfana";
import {AppContext} from "../types";
import {z} from "zod";
import {CloudflareKVStore} from "../service/store";
import {bark} from "../service/bark";
import {wechat} from "../service/wechat";

export class NotifyEndpoint extends OpenAPIRoute {

    schema = {
        tags: ["Notification"],
        summary: "batch send notifications",
        request: {
            params: z.object({
                group: z.string().describe("Group Key"),
            }),
            body: {
                content: {
                    "application/json": {
                        schema: z.object({
                            title: z.string().optional().default("Server Notify"),
                            content: z.string().optional(),
                            badge: z.coerce.number().optional(),
                            sound: z.string().optional(),
                            icon: z.string().optional(),
                            group: z.string().optional(),
                            url: z.string().optional(),
                        }),
                    }
                }
            }
        }
    };

    async handle(c: AppContext) {
        // Get validated data
        const data = await this.getValidatedData<typeof this.schema>();
        const store = new CloudflareKVStore(c.env.KV);

        // Retrieve the validated slug
        const { group } = data.params;
        const {title, content, badge, sound, icon, url} = data.body;

        // 客户端分组
        const settings = await store.getSettings();
        const clientIds = settings[group] || [];

        // 找到需要发送的客户端
        const allClients = await store.getAllClients();
        const clients = clientIds.map(id => allClients[id]).filter(client => client !== undefined);

        // 发送消息
        const tasks = clients.map(client => {
            const entity = {
                title,
                content,
                badge,
                sound,
                icon,
                url,
                group: data.body.group, // 使用 body 里的 group，或者是 data.params.group? 通常是 body 里的
                client: client.token
            };

            if (client.type === "bark") {
                return bark(entity);
            } else if (client.type === "wechat") {
                return wechat(entity);
            }
            return Promise.resolve();
        });

        const results = await Promise.allSettled(tasks);
        
        // 记录失败的请求
        const failures = results.filter(r => r.status === 'rejected');
        if (failures.length > 0) {
            console.error('Some notifications failed to send:', failures);
        }

        // 返回 success
        return Response.json({"success": true, error: JSON.stringify(failures)});
    }
}