import { DateTime, Str } from "chanfana";
import type { Context } from "hono";
import { z } from "zod";

export type AppContext = Context<{ Bindings: Env }>;

// Constants
export const API_ENDPOINTS = {
	FTQQ: "https://sctapi.ftqq.com",
	BARK: "https://bark.mikuworld.asia",
} as const;


export interface NotifyEntity {
	title: string;
	content?: string; // body
	client: string;
	badge?: number;
	sound?: string;
	icon?: string;
	group?: string;
	url?: string;
}

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
