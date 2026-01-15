import { fromHono } from "chanfana";
import { Hono } from "hono";
import { bearerAuth } from 'hono/bearer-auth'
import { WechatEndpoint } from "./endpoints/wechat";
import { BarkEndpoint } from "./endpoints/bark";
import {bearer} from "./auth/auth";
import {NotifyEndpoint} from "./endpoints/notify";

// Start a Hono app
const app = new Hono<{ Bindings: Env }>();

// Setup OpenAPI registry
const openapi = fromHono(app, {
	docs_url: "/openapi-doc",
});


// Register Auth Middleware
app.use(
	'/wechat/:client',
	bearerAuth({
		verifyToken: bearer,
	})
)
app.use(
	'/bark/:client',
	bearerAuth({
		verifyToken: bearer,
	})
)
app.use(
	'/:group',
	bearerAuth({
		verifyToken: bearer,
	})
)

// static assets
openapi.get("/", () => Response.json({"success": true}));
// 支持端点发送
openapi.get("/wechat/:client", WechatEndpoint);
openapi.get("/bark/:client", BarkEndpoint);
// 群组发送（不分类型）
openapi.post("/:group", NotifyEndpoint);

// Register OpenAPI endpoints
// You may also register routes for non OpenAPI directly on Hono
// app.get('/test', (c) => c.text('Hono!'))

// Export the Hono app
export default app;