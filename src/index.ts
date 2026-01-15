import { fromHono } from "chanfana";
import { Hono } from "hono";
import { bearerAuth } from 'hono/bearer-auth'

// Start a Hono app
const app = new Hono<{ Bindings: Env }>();

// Setup OpenAPI registry
const openapi = fromHono(app, {
	docs_url: "/openapi-doc",
});


// static assets
openapi.get("/", () => Response.json({"success": true}));
// 支持端点发送
openapi.get("/wechat/:client", );
openapi.get("/bark/:client", );
// 群组发送（不分类型）
openapi.get("/:group",);

// Register OpenAPI endpoints
// You may also register routes for non OpenAPI directly on Hono
// app.get('/test', (c) => c.text('Hono!'))

// Export the Hono app
export default app;