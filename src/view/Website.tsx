import * as React from "react";
import { slideStyle } from "./SlideUtils";

export interface WebsiteProps {
	data: any;
}

export const Website = (props: WebsiteProps) => (
	<iframe style={slideStyle({})} src={props.data.url}/>
)
