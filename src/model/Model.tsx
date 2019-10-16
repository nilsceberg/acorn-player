import { observable } from "mobx";

// Electron imports
const { ipcRenderer } = window.require("electron");
const fs = window.require("fs");

console.log(fs);

export class Model {
	@observable name: string = "";
	@observable systemMessage: string = "";

	@observable identify: boolean = false;

	constructor() {
	}
}
