import { app, BrowserWindow } from "electron";

function createWindow() {
	const win = new BrowserWindow({
		width: 800,
		height: 600,
		autoHideMenuBar: true,
		webPreferences: {
			nodeIntegration: true
		}
	});

	win.loadFile("../static/index.html");
}

app.on("ready", createWindow);
