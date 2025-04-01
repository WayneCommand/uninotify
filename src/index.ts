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
                    return new Response(indexHtml(), {headers: { 'Content-Type': 'text/html' },});
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


function indexHtml(): string {
    return `<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>API Documentation - Uninotify</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css"> <!-- Font Awesome -->
    <style>
        body {
            font-family: 'Helvetica Neue', Arial, sans-serif;
        }
        .code-block {
            background-color: #f7fafc; /* Light gray background */
            border-radius: 0.5rem; /* Rounded corners */
            padding: 0.8rem; /* Padding */
            overflow-x: auto; /* Horizontal scroll */
            position: relative; /* For positioning the button */
        }
        .btn-copy {
            background-color: transparent; /* Transparent background */
            color: #4a5568; /* Dark gray */
            border: none; /* No border */
            cursor: pointer; /* Pointer cursor */
            position: absolute; /* Absolute positioning */
            top: 1rem; /* Position from the top */
            right: 1rem; /* Position from the right */
            transition: transform 0.2s; /* Transition effect */
        }
        .btn-copy:hover {
            transform: scale(1.1); /* Slightly enlarge on hover */
        }
        h1, h2, h3, p {
            margin-bottom: 1.5rem; /* Increased bottom margin */
        }
        h3 {
            margin-top: 2rem; /* Adjusted top margin for h3 */
        }
        table {
            border-collapse: collapse; /* Collapse borders */
            width: 100%; /* Full width */
        }
        th, td {
            padding: 0.75rem; /* Padding */
            text-align: left; /* Left align text */
            border-bottom: 1px solid #e2e8f0; /* Bottom border */
        }
        th {
            background-color: #edf2f7; /* Light gray for header */
        }
    </style>
</head>
<body class="bg-gray-100 text-gray-700">
    <div class="container mx-auto p-8">
        <h1 class="text-4xl font-extrabold text-center mb-8 text-gray-800">Uninotify API Documentation</h1>
        <p class="text-center text-lg mb-8 text-gray-600">API for sending Wechat notifications using Uninotify service.</p>
        
        <div class="bg-white shadow-lg rounded-lg p-6 mb-10"> <!-- Increased shadow -->
            <h2 class="text-2xl font-semibold mb-4 text-gray-800">Wechat Notification API</h2>
            <h3 class="text-xl font-semibold mt-4 mb-2 text-gray-700">Endpoint</h3>
            <div class="code-block">POST https://notify.waynecommand.com/wechat</div>

            <h3 class="text-xl font-semibold mt-4 mb-2 text-gray-700">Request Headers</h3>
            <ul class="list-disc list-inside mb-4">
                <li><code>Content-Type: application/json</code></li>
                <li><code>Authorization: Bearer {apiKey}</code></li>
            </ul>

            <h3 class="text-xl font-semibold mt-4 mb-2 text-gray-700">Request Body</h3>
            <p>The request body must be a JSON object containing the following fields:</p>
            <table class="min-w-full bg-white border border-gray-300 mt-4">
                <thead>
                    <tr>
                        <th class="border px-4 py-2 text-gray-700">Field</th>
                        <th class="border px-4 py-2 text-gray-700">Type</th>
                        <th class="border px-4 py-2 text-gray-700">Description</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td class="border px-4 py-2">platform</td>
                        <td class="border px-4 py-2">string</td>
                        <td class="border px-4 py-2">Optional. The platform being used. Defaults to <code>iyuu</code>.</td>
                    </tr>
                    <tr>
                        <td class="border px-4 py-2">apiToken</td>
                        <td class="border px-4 py-2">string</td>
                        <td class="border px-4 py-2">Optional. The API token being used. Defaults to environment variable.</td>
                    </tr>
                    <tr>
                        <td class="border px-4 py-2">title</td>
                        <td class="border px-4 py-2">string</td>
                        <td class="border px-4 py-2">Optional. The title of the notification. Defaults to <code>Server Notify</code>.</td>
                    </tr>
                    <tr>
                        <td class="border px-4 py-2">content</td>
                        <td class="border px-4 py-2">string</td>
                        <td class="border px-4 py-2">Optional. The content of the notification. Defaults to <code>This is a default message, please check your server status.</code>.</td>
                    </tr>
                </tbody>
            </table>

            <h3 class="text-xl font-semibold mt-4 mb-2 text-gray-700">Example Request</h3>
            <div class="code-block">
                <pre>
curl -X POST --location "https://notify.waynecommand.com/wechat" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer apikey" \
    -d '{
          "platform": "",
          "apiToken": "",
          "title": "This is a new message",
          "content": "This is the message content"
        }'
                </pre>
                <button class="btn-copy" onclick="copyToClipboard()">
                    <i class="fas fa-clipboard"></i> <!-- Clipboard icon -->
                </button>
            </div>
        </div>
    </div>
    <script>
        function copyToClipboard() {
            const text = \`curl -X POST --location "https://notify.waynecommand.com/wechat" \\\\
    -H "Content-Type: application/json" \\\\
    -H "Authorization: Bearer apikey" \\\\
    -d '{
          "platform": "",
          "apiToken": "",
          "title": "This is a new message",
          "content": "This is the message content"
        }'\`;
            navigator.clipboard.writeText(text).then(() => {
                alert('Request copied to clipboard!');
            });
        }
    </script>
</body>`
}