import { app, BrowserWindow } from "electron";

async function createWindow() {
	const win = new BrowserWindow({
		width: 800,
		height: 600,
		autoHideMenuBar: true,
		webPreferences: {
			nodeIntegration: true,
		}
	});

	//await win.loadFile("../static/index.html");
	await win.loadURL("http://localhost:4444/");
}

app.on("ready", createWindow);
