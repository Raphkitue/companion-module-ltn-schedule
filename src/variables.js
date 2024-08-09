export function updateVariableDefinitions() {
	const variables = [
		{ variableId: 'currentRemainingTime', name: 'Remaining time for the currently playing element' },
		{ variableId: 'totalRemainingTime', name: 'Remaining time before rundown ends' },
		{ variableId: 'totalPlayedTime', name: 'Played time of the rundown' },
		{ variableId: 'totalDuration', name: 'Total duration of the rundown' },
	]

	this.setVariableDefinitions(variables)
}

export function updateVariables() {

	const now = Date.now();
	this.setVariableValues({
		totalRemainingTime: msToTime((this.data.startstamp + this.data.playlistLength) - now),
		totalPlayedTime: msToTime(now - this.data.startstamp),
		currentRemainingTime: msToTime(this.data.currentEndstamp - now),
		totalDuration: msToTime(this.data.playlistLength)
	})
}

function msToTime(duration) {
	var seconds = Math.floor((duration / 1000) % 60),
	minutes = Math.floor((duration / (1000 * 60)) % 60),
	hours = Math.floor((duration / (1000 * 60 * 60)));

	hours = (hours < 10) ? "0" + hours : hours;
	minutes = (minutes < 10) ? "0" + minutes : minutes;
	seconds = (seconds < 10) ? "0" + seconds : seconds;

	return hours + ":" + minutes + ":" + seconds;
}