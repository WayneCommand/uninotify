import {API_ENDPOINTS, NotifyEntity} from "../types";
import {NotifyError} from "../errors";

export async function wechat(entity: NotifyEntity): Promise<WechatNotifyResponse> {
    const notifyUri = API_ENDPOINTS.FTQQ + "/" + entity.client + ".send";

    const requestInit: RequestInit = {
        method: "POST",
        body: new URLSearchParams({
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

export interface WechatNotifyResponse {
    code: number;
    message: string;
    data?: any;
}
