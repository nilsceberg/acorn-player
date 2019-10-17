import * as React from "react";

export const SystemMessage = (props: { children: string; }): JSX.Element => (
	<div style={{ position: "fixed", left: 0, right: 0, top: 0, bottom: 0, backgroundColor: "#2e3440", color: "white", textAlign: "center" }}>
		<h1 style={{ fontSize: 46, textTransform: "uppercase" }}>
			{props.children}
		</h1>
	</div>
)
