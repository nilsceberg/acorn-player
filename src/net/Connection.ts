import WebSocket from "ws";
import uuid from "uuid";

type State = (message: any) => Promise<State>;

export class Connection {
	private ws: WebSocket;
	private url: string;
	private state: State;

	constructor(url: string) {
		this.url = url;
	}

	public start() {
		this.state = this.initState;
		this.ws = new WebSocket(this.url);
		console.log("connecting...");

		this.ws.on("close", () => {
			console.log("connection closed");
		})

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
			this.send({
				uuid: uuid.v4(),
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

	private async initState(message: any): Promise<State> {
		if (!message.name) {
			return this.close("invalid welcome");
		}

		const name = message.name;
		console.log("We are " + name)
		return this.connectedState;
	}

	private async connectedState(message: any): Promise<State> {
		console.log("Message: ", message);
		return this.connectedState;
	}

	private async disconnectedState(message: any): Promise<State> {
		console.error("this shouldn't happen");
		return this.disconnectedState;
	}
}
