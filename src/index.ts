import { Player } from "./Player";

const player = new Player();

async function start() {
	await player.loadConfig();
	document.getElementById("root").innerHTML
		= `${player.getUuid()} @ ${player.getServerUri}`;
}

start();
