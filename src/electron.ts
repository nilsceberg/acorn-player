import { app, BrowserWindow } from "electron";
import { Connection } from "./net/Connection";
import WebSocket = require("ws");
import uuid = require("uuid");

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

const conn = new Connection("ws://localhost:8080");
conn.start();
