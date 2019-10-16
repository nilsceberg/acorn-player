import * as React from "react";
import { observer } from "mobx-react";
import { Model } from "../model/Model";
import { Identify } from "./Identify";
import { Connection } from "../net/Connection";

interface AppProps {
	model: Model;
	disposeConnection: Function;
}

@observer
export class App extends React.Component<AppProps> {
	// This is a hack to close the connection when reloading with
	// fusebox HMR - there is probably a better solution
	componentWillUnmount() {
		this.props.disposeConnection();
	}

	render() {
		const { model } = this.props;
		return (
		<div>
			{
				model.systemMessage
					? <h2>{model.systemMessage}</h2>
					: model.identify
						? <Identify>{model.name}</Identify>
						: null
			}
		</div>
		);
	}
}
