// Constants
const API_ENDPOINTS = {
    FTQQ: "https://sctapi.ftqq.com/",
    IYUU: "https://iyuu.cn/"
} as const;

const PLATFORMS = {
    FTQQ: "ftqq",
    IYUU: "iyuu"
} as const;

const SUPPORTED_PLATFORMS = Object.values(PLATFORMS);

// Types
interface NotifyOptions {
    apiKey: string;
    ftqqToken: string;
    iyuuToken: string;
}

interface NotifyRequest {
    platform?: typeof SUPPORTED_PLATFORMS[number];
    apiToken?: string;
    title?: string;
    content?: string;
}

interface NotifyResponse {
    code: number;
    message: string;
    data?: any;
}

class Notify {
    constructor(
        public apiToken: string,
        public platform: string,
        public title: string = "Server Notify",
        public content: string = "This is a default message, please check your server status.",
        public endpoint: string = ""
    ) {}
}

// Error handling
class NotifyError extends Error {
    constructor(message: string, public code: number = 400) {
        super(message);
        this.name = 'NotifyError';
    }
}

// Main handler
export default {
    async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
        const url = new URL(request.url);
        
        try {
            switch (url.pathname) {
                case "/wechat":
                    return await handleWechatPlatform(request, {
                        apiKey: env.api_key,
                        ftqqToken: env.ftqq_token,
                        iyuuToken: env.iyuu_token
                    });
                default:
                    return env.ASSETS.fetch(request);
            }
        } catch (error) {
            if (error instanceof NotifyError) {
                return Response.json({ 
                    code: error.code,
                    message: error.message 
                }, { status: error.code });
            }
            return Response.json({ 
                code: 500,
                message: "Internal server error" 
            }, { status: 500 });
        }
    },
};

async function handleWechatPlatform(request: Request, options: NotifyOptions): Promise<Response> {
    if (request.method !== 'POST') {
        throw new NotifyError("Method not supported", 405);
    }

    // Authorization check
    const authorization = request.headers.get("Authorization");
    if (authorization !== `Bearer ${options.apiKey}`) {
        throw new NotifyError("No permission to invoke API", 403);
    }

    const body = await request.json() as NotifyRequest;

    // Platform validation
    if (body.platform && !SUPPORTED_PLATFORMS.includes(body.platform)) {
        throw new NotifyError("Platform not supported");
    }

    console.log(`message send: ${body.title}`, body)

    const notify = createNotifyInstance(body, options);
    const response = await sendNotification(notify);

    return Response.json(response);
}

function createNotifyInstance(body: NotifyRequest, options: NotifyOptions): Notify {
    const notify = new Notify(
        body.apiToken ?? "",
        body.platform ?? PLATFORMS.IYUU,
        body.title,
        body.content
    );

    if (body.platform === PLATFORMS.FTQQ) {
        notify.platform = PLATFORMS.FTQQ;
        notify.endpoint = API_ENDPOINTS.FTQQ;
        notify.apiToken = options.ftqqToken;
    } else {
        notify.platform = PLATFORMS.IYUU;
        notify.endpoint = API_ENDPOINTS.IYUU;
        notify.apiToken = options.iyuuToken;
    }

    return notify;
}

async function sendNotification(notify: Notify): Promise<NotifyResponse> {
    const notifyUri = `${notify.endpoint}${notify.apiToken}.send`;
    
    const requestInit: RequestInit = {
        method: "POST",
        body: new URLSearchParams({
            text: notify.title,
            desp: notify.content
        }),
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        redirect: "follow",
        cf: { apps: false }
    };

    const response = await fetch(new Request(notifyUri, requestInit));
    
    if (!response.ok) {
        throw new NotifyError(`Notification service error: ${response.statusText}`, response.status);
    }

    return await response.json();
}