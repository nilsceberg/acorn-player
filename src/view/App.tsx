import * as React from "react";
import { observer } from "mobx-react";
import { Model } from "../model/Model";
import { Identify } from "./Identify";
import { Connection } from "../net/Connection";
import { Website } from "./Website";

interface AppProps {
	model: Model;
	disposeConnection: Function;
}

const ItemTypeMap: { [type: string]: (props: { data: any }) => JSX.Element } = {
	"website": Website,
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

		let slide: JSX.Element = null;
		if (model.slide && model.slide.type in ItemTypeMap) {
			const Item = ItemTypeMap[model.slide.type];
			slide = <Item data={model.slide.data}/>
		}

		return (
		<div>
			{ slide }
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
