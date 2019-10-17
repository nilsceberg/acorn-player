import { Model } from "../model/Model";

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

	private model: Model;

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
			});
			this.log("sent");
			
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

	private close(reason?: string): State {
		this.log("Closing connection: " + reason);
		this.ws.close();
		return this.disconnectedState;
	}

	public dispose() {
		this.disposed = true;
		this.close("Disposing");
	}

	private async initState(message: any): Promise<State> {
		if (!message.name) {
			return this.close("invalid welcome: " + JSON.stringify(message));
		}

		const name = message.name;
		this.log("We are " + name);

		// Reset state
		this.model.systemMessage = "";
		this.model.name = name;
		this.model.identify = false;
		this.model.slide = null;

		return this.connectedState;
	}

	private async connectedState(message: any): Promise<State> {
		this.log("Message: ", message);

		if (message.identify !== undefined) {
			this.model.identify = message.identify;
		}

		if (message.display !== undefined) {
			this.model.slide = message.display;
		}

		if (message.rename !== undefined) {
			this.model.name = message.rename;
		}

		return this.connectedState;
	}

	private async disconnectedState(message: any): Promise<State> {
		this.log("this shouldn't happen");
		return this.disconnectedState;
	}
}
