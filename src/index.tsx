import * as React from "react";
import * as ReactDOM from "react-dom";
import { App } from "./view/App";
import { Model } from "./model/Model";
import { Connection } from "./net/Connection";
import { Player } from "./Player";

const globalState = new Model();
const player = new Player();

async function start() {
	await player.loadConfig();
	globalState.systemMessage = player.getUuid() + " @ " + player.getServerUri();
	const conn = new Connection(player.getServerUri(), player.getUuid(), globalState);
	conn.connect();

	ReactDOM.render(<App model={globalState} disposeConnection={() => conn.dispose()}/>, document.getElementById("root"));
}

start();
