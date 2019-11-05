import { Model } from "../model/Model";

import * as os from "os";
import WebSocket from "ws";
import { sleep } from "../util/async";

import { v4 as createUuid } from "uuid";

type State = (message: any) => Promise<State>;

export class Connection {
	private ws: WebSocket;
	private state: State;
	private disposed: boolean;

	private connectionUuid: string;
	private url: string;
	private uuid: string;
	private heartbeat: boolean = true;
	private model: Model;

	private heartbeatClear: NodeJS.Timeout;
	private heartbeatExpect: NodeJS.Timeout;

	constructor(url: string, uuid: string, model: Model) {
		this.url = url;
		this.uuid = uuid;
		this.model = model;
		this.connectionUuid = createUuid();
	}

	private log(...message: string[]) {
		console.log(`[${this.connectionUuid}] `, ...message);
	}

	public connect() {
		this.log("connecting...");
		this.state = null;
		this.ws = new WebSocket(this.url);

		this.ws.on("close", async () => {
			this.model.systemMessage = "Connection lost";
			if (this.disposed) {
				this.log("Disposed; not reconnecting.");
				return;
			}

			if (this.state) {
				this.log("connection closed; reconnecting...");
			} else {
				this.log("connection failed; retrying in 1s...");
				await sleep(1000);
			}
			this.connect();
		});

		this.ws.on("error", () => {
			this.log("Connection error");
		});

		this.ws.once("message", this.onMessage);

		this.ws.on("open", () => {
			this.log("connected");
			// Once we initially connect, send a "hello" message with
			// our uuid in order to authenticate ourselves and
			// establish the connection.
			this.state = this.initState;
			this.send({
				uuid: this.uuid,
				hostname: os.hostname(),
			});
			this.log("sent");
		});

		this.ws.on("ping", () => {
			console.log("ping");
			this.heartbeat = true;
			this.heartbeatClear = setTimeout(() => {
				this.heartbeat = false;
			}, 3000);

			this.heartbeatExpect = setTimeout(() => {
				if (!this.heartbeat) {
					this.state = this.close("heartbeat lost", true);
				}
			}, 7000);
		});
	}

	private onMessage = async (data: Buffer) => {
		try {
			this.log("message: " + data.toString());
			const message = JSON.parse(data.toString());
			this.state = await this.state(message);
			this.log("-> " + this.state.name);
		} catch (e) {
			this.log(e);
			this.close("invalid JSON")
		} finally {
			this.ws.once("message", this.onMessage);
		}
	}

	private send(message: any) {
		this.ws.send(JSON.stringify(message));
	}

	private close(reason?: string, force: boolean = false): State {
		this.log("Closing connection: " + reason);
		clearInterval(this.heartbeatClear);
		clearInterval(this.heartbeatExpect);
		if (force) {
			this.ws.terminate();
		}
		else {
			this.ws.close();
		}
		return this.disconnectedState;
	}

	public dispose() {
		this.disposed = true;
		this.close("Disposing");
	}

	private async initState(message: any): Promise<State> {
		if (message.name !== undefined) {
			this.onWelcome(message.name);
			return this.connectedState;
		}

		if (message.pending !== undefined) {
			this.model.systemMessage = "Awaiting registration";
			return this.pendingState;
		}

		this.close("Invalid welcome");
	}

	private onWelcome(name: string) {
		this.log("We are " + name);

		// Reset state
		this.model.systemMessage = "";
		this.model.name = name;
		this.model.identify = false;
		this.model.slide = null;
	}

	private async pendingState(message: any): Promise<State> {
		this.log("Message: ", message);

		if (message.name !== undefined) {
			this.onWelcome(message.name);
			return this.connectedState;
		}

		this.close("Invalid welcome");
	}

	private async connectedState(message: any): Promise<State> {
		this.log("Message: ", message);
		this.model.systemMessage = "";

		if (message.identify !== undefined) {
			this.model.identify = message.identify;
		}

		if (message.display !== undefined) {
			this.model.slide = message.display;
		}

		if (message.rename !== undefined) {
			this.model.name = message.rename;
		}

		if (message.system !== undefined) {
			this.model.systemMessage = message.system;
		}

		return this.connectedState;
	}

	private async disconnectedState(message: any): Promise<State> {
		this.log("this shouldn't happen");
		return this.disconnectedState;
	}
}
