import {API_ENDPOINTS, NotifyEntity} from "../types";
import {NotifyError} from "../errors";

export async function bark(entity: NotifyEntity): Promise<BarkNotifyResponse> {
    const notifyUri = API_ENDPOINTS.BARK + "/" + entity.client;

    const body: any = {
        title: entity.title || "Server Notify",
        body: entity.content || "",
    };

    if (entity.badge !== undefined) body.badge = entity.badge;
    if (entity.sound !== undefined) body.sound = entity.sound;
    if (entity.icon !== undefined) body.icon = entity.icon;
    if (entity.group !== undefined) body.group = entity.group;
    if (entity.url !== undefined) body.url = entity.url;

    const requestInit: RequestInit = {
        method: "POST",
        body: JSON.stringify(body),
        headers: {
            "Content-Type": "application/json; charset=utf-8"
        },
        redirect: "follow"
    };

    const response = await fetch(new Request(notifyUri, requestInit));

    if (!response.ok) {
        throw new NotifyError(`Bark notification service error: ${response.statusText}`, `BARK_ERROR_${response.status}`);
    }
    
    return await response.json() as BarkNotifyResponse;
}

export interface BarkNotifyResponse {
    code: number;
    message: string;
    timestamp: number;
}
