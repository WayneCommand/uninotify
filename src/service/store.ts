export interface NotifyClient {
	token: string;
	type: string;
}

export type NotifySettings = Record<string, string[]>;

export interface KVStore {
	getAllClients(): Promise<Record<string, NotifyClient>>;
	getClient(clientId: string): Promise<NotifyClient | null>;
	getSettings(): Promise<NotifySettings>;
}

export class CloudflareKVStore implements KVStore {
	private kv: KVNamespace;
	private readonly CLIENTS_KEY = "notify_clients";
	private readonly SETTINGS_KEY = "notify_settings";

	constructor(kv: KVNamespace) {
		this.kv = kv;
	}

	async getAllClients(): Promise<Record<string, NotifyClient>> {
		const data = await this.kv.get(this.CLIENTS_KEY, "json");
		return (data as Record<string, NotifyClient>) || {};
	}

	async getClient(clientId: string): Promise<NotifyClient | null> {
		const clients = await this.getAllClients();
		return clients[clientId] || null;
	}

	async getSettings(): Promise<NotifySettings> {
		const data = await this.kv.get(this.SETTINGS_KEY, "json");
		return (data as NotifySettings) || {};
	}
}
