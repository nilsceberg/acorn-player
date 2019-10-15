import * as React from "react";
import { observer } from "mobx-react";
import { Model } from "../model/Model";

interface AppProps {
	model: Model;
}

@observer
export class App extends React.Component<AppProps> {
	render() {
		return <div>{this.props.model.systemMessage}</div>;
	}
}
