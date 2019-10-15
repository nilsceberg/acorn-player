import { observable } from "mobx";

// Electron imports
const { ipcRenderer } = window.require("electron");
const fs = window.require("fs");

console.log(fs);

export class Model {
	@observable systemMessage: string = "";

	constructor() {
	}
}
