export function updateVariableDefinitions() {
	const variables = [
		{ variableId: 'currentRemainingTime', name: 'Remaining time for the currently playing element' },
		{ variableId: 'totalRemainingTime', name: 'Remaining time before rundown ends' },
		{ variableId: 'totalPlayedTime', name: 'Played time of the rundown' },
	]

	this.setVariableDefinitions(variables)
}

export function updateVariables() {

	const now = Date.now();
	this.setVariableValues({
		totalRemainingTime: new Date((this.data.startstamp + this.data.endstamp) - now).toISOString().slice(11, 19),
		totalPlayedTime: new Date(now - this.data.startstamp).toISOString().slice(11, 19),
		currentRemainingTime: new Date(this.data.currentEndstamp - now).toISOString().slice(11, 19)
	})
}
