import { Model } from "../model/Model";

import WebSocket from "ws";
import { sleep } from "../util/async";

type State = (message: any) => Promise<State>;

export class Connection {
	private ws: WebSocket;
	private state: State;
	private disposed: boolean;

	private url: string;
	private uuid: string;

	private model: Model;

	constructor(url: string, uuid: string, model: Model) {
		this.url = url;
		this.uuid = uuid;
		this.model = model;
	}

	public connect() {
		console.log("connecting...");
		this.state = null;
		this.ws = new WebSocket(this.url);

		this.ws.on("close", async () => {
			this.model.systemMessage = "Connection lost";
			if (this.disposed) {
				console.log("Disposed; not reconnecting.");
				return;
			}

			if (this.state) {
				console.log("connection closed; reconnecting...");
			} else {
				console.log("connection failed; retrying in 1s...");
				await sleep(1000);
			}
			this.connect();
		});

		this.ws.on("error", () => {
		});

		this.ws.on("message", async data => {
			try {
				const message = JSON.parse(data.toString());
				this.state = await this.state(message);
			} catch (e) {
				console.log(e);
				this.close("invalid JSON")
			}
		});

		this.ws.on("open", () => {
			console.log("connected");
			// Once we initially connect, send a "hello" message with
			// our uuid in order to authenticate ourselves and
			// establish the connection.
			this.state = this.initState;
			this.send({
				uuid: this.uuid,
			});
			console.log("sent");
			
		});
	}

	private send(message: any) {
		this.ws.send(JSON.stringify(message));
	}

	private close(reason?: string): State {
		console.log("Closing connection: " + reason);
		this.ws.close();
		return this.disconnectedState;
	}

	public dispose() {
		this.disposed = true;
		this.close("Disposing");
	}

	private async initState(message: any): Promise<State> {
		if (!message.name) {
			return this.close("invalid welcome");
		}

		const name = message.name;
		console.log("We are " + name);
		//this.model.systemMessage = "Connected as " + name;
		this.model.systemMessage = "";
		this.model.name = name;
		return this.connectedState;
	}

	private async connectedState(message: any): Promise<State> {
		console.log("Message: ", message);

		if (message.identify !== undefined) {
			this.model.identify = message.identify;
		}

		return this.connectedState;
	}

	private async disconnectedState(message: any): Promise<State> {
		console.error("this shouldn't happen");
		return this.disconnectedState;
	}
}
