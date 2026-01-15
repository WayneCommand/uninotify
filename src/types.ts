import { DateTime, Str } from "chanfana";
import type { Context } from "hono";
import { z } from "zod";

export type AppContext = Context<{ Bindings: Env }>;

export const Task = z.object({
	name: Str({ example: "lorem" }),
	slug: Str(),
	description: Str({ required: false }),
	completed: z.boolean().default(false),
	due_date: DateTime(),
});

export const NotifyRequest = z.object({
	title: Str({ required: false }),
	content: Str({ required: false }),
	icon: Str({ required: false }),
	group: Str({ required: false }),
	url: Str({ required: false }),
});

export const NotifyResponse = z.object({
	code: Str(),
	message: Str(),
	data: z.any().optional(),
});
