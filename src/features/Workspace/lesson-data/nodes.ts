interface Nodes {
	[key: string]: { name: string };
}

const nodes: Nodes = {
	intro: { name: "Intro" },
	variables: { name: "Variables" },
	"redefining-variables": { name: "Redefining Variables" },
};

export default function getNodeName(skillNodeId: string): string {
	return (
		nodes?.[skillNodeId].name ??
		skillNodeId.charAt(0).toUpperCase() +
			skillNodeId.slice(1).replace("-", " ")
	);
}
