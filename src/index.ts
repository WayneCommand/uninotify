// Constants
const API_ENDPOINTS = {
    FTQQ: "https://sctapi.ftqq.com",
	BARK: "https://bark.mikuworld.asia",
} as const;

// Types
interface NotifyOptions {
    apiToken: string;
}

interface NotifyRequest {
    title?: string;
    content?: string;
	icon?: string;
	group?: string;
	url?: string;
}

interface NotifyResponse {
    code: string;
    message: string;
	data?: any;
}

interface WechatNotifyResponse {
    code: number;
    message: string;
    data?: any;
}

// Error handling
class NotifyError extends Error {
	constructor(message: string, public code: string = "API_ERROR") {
		super(message);
		this.name = 'NotifyError';
	}
}

class Notify {
    constructor(
        public apiToken: string,
        public title: string = "Server Notify",
        public content: string = "This is a default message, please check your server status.",
        public endpoint: string = ""
    ) {}
}


// Main handler
export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const url = new URL(request.url);

		try {
			// Authorization check
			const authorization = request.headers.get("Authorization");
			// 如果没有认证头，直接拒绝
			if (!authorization) {
				return resp({
					code: "UNAUTHORIZED",
					message: "No permission to invoke API"
				} as NotifyResponse, 401);
			}



			switch (url.pathname) {
				// 兼容以前的API？
				case "/wechat": {
					if (request.method !== 'POST') {
						resp({
							code: "METHOD_NOT_ALLOWED",
							message: "Method not supported"
						}, 405);
					}

					const body = await request.json() as NotifyRequest;

					let wechatNotifyResponse = await handleWechatPlatform(body, {
						apiToken: env.ftqq_token
					});

					return resp({
						code: "SUCCESS",
						message: "success",
						data: wechatNotifyResponse
					})
				}
				default:
					return env.ASSETS.fetch(request);
			}
		} catch (error) {
			if (error instanceof NotifyError) {
				return resp({
					code: error.code,
					message: error.message
				} as NotifyResponse, 400);
			}
			return resp({
				code: "INTERNAL_SERVER_ERROR",
				message: "Internal server error"
			} as NotifyResponse, 500);

		}
	},
};


function resp(response: NotifyResponse, status?: number): Response {
	return Response.json(response, {status: status || 200});
}

async function handleWechatPlatform(body: NotifyRequest, options: NotifyOptions): Promise<WechatNotifyResponse> {
    console.log(`message send: ${body.title}`, body)

	const notifyUri = API_ENDPOINTS.FTQQ + "/" + options.apiToken + ".send";

	const requestInit: RequestInit = {
		method: "POST",
		body: new URLSearchParams({
			// 发送之前确认默认值
			text: body.title || "Server Notify",
			desp: body.content || "This is a default message, please check your server status."
		}),
		headers: {
			"Content-Type": "application/x-www-form-urlencoded"
		},
		redirect: "follow",
		cf: { apps: false }
	};

	const response = await fetch(new Request(notifyUri, requestInit));

	if (!response.ok) {
		throw new NotifyError(`Notification service error: ${response.statusText}`, `FTQQ_ERROR_${response.status}`);
	}
	return await response.json();
}
