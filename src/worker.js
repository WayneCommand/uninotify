/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run "npm run dev" in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run "npm run deploy" to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

const ftqqEndpoint = "https://sctapi.ftqq.com/";
const iyuuEndpoint = "https://iyuu.cn/";

const iyuuPlatform = "iyuu";
const ftqqPlatform = "ftqq";

const platforms = ["ftqq", "iyuu"];


export default {
  async fetch(request, env, ctx) {
	  const url = new URL(request.url);
	  const { pathname, search } = url;

	  // router
	  switch (pathname) {
		  case "/wechat": {
			  const options = {
				  apiKey: env.api_key,
				  ftqqToken: env.ftqq_token,
				  iyuuToken: env.iyuu_token
			  }

			  return wechatPlatform(request, options)
		  }


		  default: return Response.json({"message": "Hello, Notify Service is online."})
	  }
  },
};

const wechatPlatform = async (request, options) => {

	if (request.method === 'GET') return Response.json({"error": "method not supported."})

	// 简单版的权限校验
	// Authorization: Bearer $OPENAI_API_KEY
	const authorization = request.headers.get("Authorization");
	if (authorization !== `Bearer ${options.apiKey}`) return Response.json({"message": "No permission invoke API"});

	const body = await request.json();

	// 校验平台
	if (body.platform) {
		if (platforms.indexOf(body.platform) === -1) return Response.json({"message": "platform not supported."})
	}

	let notify = new Notify(body.apiToken, body.platform, body.title, body.content, "default");


	// platform
	switch (body.platform) {
		case ftqqPlatform: {
			notify.platform = ftqqPlatform
			notify.endpoint = ftqqEndpoint
			notify.apiToken = options.ftqqToken
			break
		}
		default: {
			notify.platform = iyuuPlatform
			notify.endpoint = iyuuEndpoint
			notify.apiToken = options.iyuuToken
		}
	}

	let resp = await serverChanCompatibleAPI(notify);

	return Response.json(resp)
}

/**
 * @param {Notify} notify
 * @returns {any} token json
 */
const serverChanCompatibleAPI = async (notify) => {
	const notify_uri = notify.endpoint + notify.apiToken + ".send";

	const _init = {
		// Change method
		method: "POST",
		// Change body
		body: new URLSearchParams({text: notify.title, desp: notify.content}),
		// Change the redirect mode.
		redirect: "follow",
		// Change headers, note this method will erase existing headers
		headers: {
			"Content-Type": "application/x-www-form-urlencoded"
		},
		// Change a Cloudflare feature on the outbound response
		cf: { apps: false },
	}

	const response = await fetch(new Request(notify_uri, _init))

	console.log(response)

	// default resp
	return await response.json()
}

class Notify {
	constructor(apiToken, platform, title, content, endpoint) {
		this.apiToken = apiToken;
		this.platform = platform;
		this.title = title ? title : "Server Notify";
		this.content = content ? content : "this is a default message, plz check your server status.";
		this.endpoint = endpoint;
	}
}
