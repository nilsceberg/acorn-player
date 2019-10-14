import { app, BrowserWindow } from "electron";
import { Player } from "./Player";

async function createWindow() {
	const win = new BrowserWindow({
		width: 800,
		height: 600,
		autoHideMenuBar: true,
		webPreferences: {
			nodeIntegration: true
		}
	});

	await win.loadFile("../static/index.html");
}

app.on("ready", createWindow);

const player = new Player();
player.loadConfig();
