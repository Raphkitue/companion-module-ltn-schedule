export function updateVariableDefinitions() {
	const variables = [
		{ variableId: 'currentRemainingTime', name: 'Remaining time for the currently playing element' },
		{ variableId: 'totalRemainingTime', name: 'Remaining time before rundown ends' },
		{ variableId: 'totalPlayedTime', name: 'Played time of the rundown' },
		{ variableId: 'totalDuration', name: 'Total duration of the rundown' },
		{ variableId: 'adRemainingTime', name: 'Remaining time for the currently playing ad break' },
		{ variableId: 'elementRunning', name: 'ID of the current running element' },
		{ variableId: 'elementRunningIndex', name: 'Index of the current running element' }
		
	]

	this.setVariableDefinitions(variables)
}

export function updateVariables() {
	if (this.data.apiVersion < 7) {
		return
	}

	var remainingAd = this.data.adRunning

	if (remainingAd <= 0) {
		remainingAd = '0'
	} else {
		this.data.adRunning = this.data.adRunning - 1
	}

	const now = Date.now()
	if (this.data.playoutRunning) {
		this.setVariableValues({
			totalRemainingTime: msToTime(this.data.startstamp + this.data.playlistLength - now),
			totalPlayedTime: msToTime(now - this.data.startstamp),
			currentRemainingTime: msToTime(this.data.currentEndstamp - now),
			totalDuration: msToTime(this.data.playlistLength),
			adRemainingTime: remainingAd,
			elementRunning: this.data.elementRunning,
			elementRunningIndex: this.data.elementRunningIndex,
		})
	} else {
		this.setVariableValues({
			totalRemainingTime: msToTime(this.data.startstamp + this.data.playlistLength - now),
			totalPlayedTime: msToTime(-1),
			currentRemainingTime: msToTime(-1),
			totalDuration: msToTime(this.data.playlistLength),
			adRemainingTime: remainingAd,
			elementRunning: '',
			elementRunningIndex: 0,
		})
	}
}

function msToTime(duration) {
	if (duration < 0) {
		return '00:00:00'
	}

	var seconds = Math.floor((duration / 1000) % 60),
		minutes = Math.floor((duration / (1000 * 60)) % 60),
		hours = Math.floor(duration / (1000 * 60 * 60))

	hours = hours < 10 ? '0' + hours : hours
	minutes = minutes < 10 ? '0' + minutes : minutes
	seconds = seconds < 10 ? '0' + seconds : seconds

	return hours + ':' + minutes + ':' + seconds
}
