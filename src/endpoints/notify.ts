import {OpenAPIRoute} from "chanfana";
import {AppContext} from "../types";
import {NotifyError} from "../errors";

// Constants
const API_ENDPOINTS = {
    FTQQ: "https://sctapi.ftqq.com",
    BARK: "https://bark.mikuworld.asia",
} as const;

export class NotifyEndpoint extends OpenAPIRoute {

    async handle(c: AppContext) {
        // Get validated data
        const data = await this.getValidatedData<typeof this.schema>();

        // Retrieve the validated slug
        const { value } = data.query;


        // 什么都不做，返回 success, 认证器会处理认证过程.
        return Response.json({"success": true});
    }
}



/*
if (error instanceof NotifyError) {
    return resp({
        code: error.code,
        message: error.message
    } as NotifyResponse, 400);
}
*/


async function wechat(entity: NotifyEntity): Promise<WechatNotifyResponse> {
    const notifyUri = API_ENDPOINTS.FTQQ + "/" + entity.client + ".send";

    const requestInit: RequestInit = {
        method: "POST",
        body: new URLSearchParams({
            // 发送之前确认默认值
            text: entity.title || "Server Notify",
            desp: entity.content || ""
        }),
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        redirect: "follow"
    };

    const response = await fetch(new Request(notifyUri, requestInit));

    if (!response.ok) {
        throw new NotifyError(`Notification service error: ${response.statusText}`, `FTQQ_ERROR_${response.status}`);
    }
    return await response.json() as WechatNotifyResponse;
}

// 消息承载体
interface NotifyEntity {
    title: string;
    content?: string;
    client: string;
}

// 微信消息响应
interface WechatNotifyResponse {
    code: number;
    message: string;
    data?: any;
}