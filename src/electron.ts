import { app, BrowserWindow } from "electron";

async function createWindow() {
	let win = new BrowserWindow({
		width: 800,
		height: 600,
		autoHideMenuBar: true,
		webPreferences: {
			nodeIntegration: true,
		}
	});

	var onHeadersReceived = (d: any, c: any) => {
		if (d.responseHeaders['X-Frame-Options']) {
			delete d.responseHeaders['X-Frame-Options'];
		}
		c({ cancel: false, responseHeaders: d.responseHeaders });
	}
	win.webContents.session.webRequest.onHeadersReceived(onHeadersReceived);

	win.on('closed', function () {
		win.removeAllListeners();
		win = null;
	});

	//await win.loadFile("../static/index.html");
	await win.loadURL("http://localhost:4444/");
}

app.on("ready", createWindow);
