/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run "npm run dev" in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run "npm run deploy" to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

class Notify {
	constructor(apiToken, platform, title, content) {
		this.apiToken = apiToken;
		this.platform = platform;
		this.title = title ? title : "Server Notify";
		this.content = content ? content : "this is a default message, plz check your server status.";
	}
}

export default {
  async fetch(request, env, ctx) {
	  const url = new URL(request.url);
	  const { pathname, search } = url;

	  // router
	  switch (pathname) {
		  case "/wechat": {

			  return wechatPlatform(request, env, ctx)
		  }


		  default: return Response.json({"message": "Hello, Notify Service is online."})
	  }
  },
};

const wechatPlatform = async (request, env, ctx) => {

	if (request.method === 'GET') return Response.json({"error": "method not supported."})

	// 简单版的权限校验
	// Authorization: Bearer $OPENAI_API_KEY
	const authorization = request.headers.get("Authorization");
	if (authorization !== `Bearer ${env.api_key}`) return Response.json({"message": "No permission invoke API"});

	const body = await request.json();

	let resp = Response.json({"message": "notify sent."})

	// platform
	switch (body.platform) {
		case "ftqq": {
			resp = await ftqq(new Notify(body.apiToken? body.apiToken : env.ftqq_token, "ftqq", body.title, body.content))

			break
		}
		// default
		default: {
			resp = await iyuu(new Notify(body.apiToken? body.apiToken: env.iyuu_token, "iyuu", body.title, body.content))
		}

	}

	return Response.json(resp)
}


/**
 * @param {Notify} notify
 * @returns {any} token json
 */
const iyuu = async (notify) => {

	const notify_uri = `https://iyuu.cn/${notify.apiToken}.send`;

	let formData = new URLSearchParams()
	formData.set("text", notify.title)
	formData.set("desp", notify.content)

	const _init = {
		// Change method
		method: "POST",
		// Change body
		body: formData,
		// Change the redirect mode.
		redirect: "follow",
		// Change headers, note this method will erase existing headers
		headers: {
			"Content-Type": "application/x-www-form-urlencoded"
		},
		// Change a Cloudflare feature on the outbound response
		cf: { apps: false },
	}

	const tokenRequest = new Request(notify_uri, _init)

	const token = await fetch(tokenRequest)

	// default resp
	return await token.json()
}

/**
 * @param {Notify} notify
 * @returns {any} token json
 */
const ftqq = async (notify) => {

	const notify_uri = `https://sctapi.ftqq.com/${notify.apiToken}.send`;

	let formData = new URLSearchParams()
	formData.set("text", notify.title)
	formData.set("desp", notify.content)

	const _init = {
		// Change method
		method: "POST",
		// Change body
		body: formData,
		// Change the redirect mode.
		redirect: "follow",
		// Change headers, note this method will erase existing headers
		headers: {
			"Content-Type": "application/x-www-form-urlencoded"
		},
		// Change a Cloudflare feature on the outbound response
		cf: { apps: false },
	}

	const tokenRequest = new Request(notify_uri, _init)

	const token = await fetch(tokenRequest)

	// default resp
	return await token.json()
}
