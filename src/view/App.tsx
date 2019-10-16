import * as React from "react";
import { observer } from "mobx-react";
import { Model } from "../model/Model";
import { Identify } from "./Identify";

interface AppProps {
	model: Model;
}

@observer
export class App extends React.Component<AppProps> {
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
