import * as uuid from "uuid";
import { promises as fs } from "fs";

export class Player {
	private server: string;
	private uuid: string;

	constructor() {

	}

	async loadConfig() {
		let file = await fs.open("config.json", "r");
		const config = JSON.parse((await file.readFile()).toString("utf-8"));
		this.server = config.server;
		await file.close();

		try {
			file = await fs.open("local.json", "r");
			const localConfig = JSON.parse((await file.readFile()).toString("utf-8"));

			if (!localConfig.uuid) throw new Error("invalid uuid");

			this.uuid = localConfig.uuid;
		}
		catch (e) {
			file = await fs.open("local.json", "w");
			this.uuid = uuid.v4();
			const localConfig = JSON.stringify({ uuid: this.uuid });
			await file.writeFile(localConfig, {
				encoding: "utf-8"
			});
		}
		await file.close();

		console.log("Loaded config:");
		console.log(" * UUID: " + this.uuid);
		console.log(" * Server: " + this.server);
	}

	public getServerUri(): string {
		return this.server;
	}

	public getUuid(): string {
		return this.uuid;
	}
}
