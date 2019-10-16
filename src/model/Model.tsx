import { observable } from "mobx";

// Electron imports
const { ipcRenderer } = window.require("electron");
const fs = window.require("fs");

console.log(fs);

export interface Slide {
	type: string;
	data: any;
}

export class Model {
	@observable name: string = "";
	@observable systemMessage: string = "";

	@observable identify: boolean = false;
	
	@observable slide: Slide = null;

	constructor() {
	}
}
