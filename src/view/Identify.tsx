import * as React from "react";

export const Identify = (props: { children: string; }): JSX.Element => (
	<div style={{ position: "fixed", left: 0, right: 0, top: 0, bottom: 0, backgroundColor: "#00ff00", textAlign: "center" }}>
		<h1 style={{ fontSize: 88, textTransform: "uppercase" }}>
			{props.children}
		</h1>
	</div>
)
