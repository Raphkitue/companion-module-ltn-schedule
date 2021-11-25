exports.initFeedbacks = function () {
	const feedbacks = {}

	const lightBlue = this.rgb(91, 198, 233)
	const lightBlueDisabled = this.rgb(63, 184, 223)
	const darkGrey = this.rgb(27, 27, 27)
	const lightGrey = this.rgb(117, 117, 117)
	const green = this.rgb(93, 224, 130)
	const red = this.rgb(231, 88, 59)

	const targets = {
		type: 'dropdown',
		multiple: true,
		label: 'Push Targets',
		id: 'targets',
		default: 'select',
		choices: this.data.targets.concat({ id: 'select', label: 'Select a target' }),
	}

	const foregroundColor = {
		type: 'colorpicker',
		label: 'Foreground color',
		id: 'fg',
		default: this.rgb(255, 255, 255),
	}

	feedbacks.playbackStatus = {
		type: 'boolean',
		label: 'Playout running status',
		description: 'Indicates if the playout is running',
		style: {
			bgcolor: red
		}
	}

	if(this.data.apiVersion > 1) {
		feedbacks.breakingNewsStatus = {
			type: 'boolean',
			label: 'Breaking news running status',
			description: 'Indicates if the breaking news are displayed',
			style: {
				bgcolor: red
			}
		}
	}

	feedbacks.targetsStatus = {
		label: 'Targets publish status',
		description: 'Indicate if all the selected targets are published',
		options: [
			targets,
			foregroundColor,
			{
				type: 'colorpicker',
				label: 'Targets disabled',
				id: 'bgDisabled',
				default: darkGrey,
			},
			{
				type: 'colorpicker',
				label: 'Targets enabled',
				id: 'bgEnabled',
				default: lightGrey,
			},
			{
				type: 'colorpicker',
				label: 'Targets pushing',
				id: 'bgPushing',
				default: green,
			},
			{
				type: 'colorpicker',
				label: 'Targets pushing with problem',
				id: 'bgPushingProblem',
				default: red,
			},
		],
	}

	feedbacks.publishStatus = {
		label: 'Publish status',
		description: 'Indicate if the Schedule instance is currently publishing',
		options: [
			foregroundColor,
			{
				type: 'colorpicker',
				label: 'Playback not running',
				id: 'bgDisabled',
				default: lightBlueDisabled,
			},
			{
				type: 'colorpicker',
				label: 'Playback running, publish possible',
				id: 'bgEnabled',
				default: lightBlue,
			},
			{
				type: 'colorpicker',
				label: 'Publish running',
				id: 'bgPushing',
				default: red,
			},
		],
	}

	feedbacks.skippableStatus = {
		label: 'Skippable status',
		description: 'Indicate if a skip is possible',
		options: [
			foregroundColor,
			{
				type: 'colorpicker',
				label: 'Not skippable',
				id: 'bgDisabled',
				default: darkGrey,
			},
			{
				type: 'colorpicker',
				label: 'Skippable',
				id: 'bgEnabled',
				default: lightBlue,
			},
			{
				type: 'colorpicker',
				label: 'Skipped, cooldown',
				id: 'bgSkipped',
				default: green,
			},
		],
	}

	feedbacks.adTriggerStatus = {
		label: 'Ad trigger status',
		description: 'Indicate if an ad is or can be triggered',
		options: [
			foregroundColor,
			{
				type: 'colorpicker',
				label: 'Triggering an ad is not possible',
				id: 'bgDisabled',
				default: darkGrey,
			},
			{
				type: 'colorpicker',
				label: 'Triggering an ad is possible',
				id: 'bgEnabled',
				default: lightBlue,
			},
			{
				type: 'colorpicker',
				label: 'Ad is currently playing',
				id: 'bgPushing',
				default: green,
			},
		],
	}
	return feedbacks
}

exports.executeFeedback = function (feedback, bank) {
	if (feedback.type === 'targetsStatus') {
		var actualSelectedTargets = feedback.options.targets.filter((target) => target !== 'select')
		var someDisabled = this.data.targets
			.filter((target) => actualSelectedTargets.some((selected) => selected === target.id))
			.some((target) => !target.enabled)
		var someProblem = this.data.targets
			.filter((target) => actualSelectedTargets.some((selected) => selected === target.id))
			.some((target) => target.status != 2)

		if (actualSelectedTargets.length === 0) {
			return { color: feedback.options.fg, bgcolor: feedback.options.bgDisabled }
		} else if (this.data.publishRunning) {
			if (someDisabled) {
				return { color: feedback.options.fg, bgcolor: feedback.options.bgDisabled }
			} else if (someProblem) {
				return { color: feedback.options.fg, bgcolor: feedback.options.bgPushingProblem }
			} else {
				return { color: feedback.options.fg, bgcolor: feedback.options.bgPushing }
			}
		} else {
			if (someDisabled) {
				return { color: feedback.options.fg, bgcolor: feedback.options.bgDisabled }
			} else {
				return { color: feedback.options.fg, bgcolor: feedback.options.bgEnabled }
			}
		}
	} else if (feedback.type === 'playbackStatus') {
		return this.data.playoutRunning
	} else if (feedback.type === 'breakingNewsStatus') {
		return this.data.breakingNewsRunning
	} else if (feedback.type === 'publishStatus') {
		if (this.data.playoutRunning && this.data.publishRunning) {
			return { color: feedback.options.fg, bgcolor: feedback.options.bgPushing }
		} else if (this.data.playoutRunning) {
			return { color: feedback.options.fg, bgcolor: feedback.options.bgEnabled }
		} else {
			return { color: feedback.options.fg, bgcolor: feedback.options.bgDisabled }
		}
	} else if (feedback.type === 'skippableStatus') {
		if (this.data.skipUsed) {
			return { color: feedback.options.fg, bgcolor: feedback.options.bgSkipped }
		} else if (!this.data.playoutRunning) {
			return { color: feedback.options.fg, bgcolor: feedback.options.bgDisabled }
		} else {
			return { color: feedback.options.fg, bgcolor: feedback.options.bgEnabled }
		}
	} else if (feedback.type === 'adTriggerStatus') {
		if (this.data.adRunning != 0) {
			return { color: feedback.options.fg, bgcolor: feedback.options.bgPushing }
		} else if (this.data.currentItemType === 'livestream' && this.data.publishRunning) {
			return { color: feedback.options.fg, bgcolor: feedback.options.bgEnabled }
		} else {
			return { color: feedback.options.fg, bgcolor: feedback.options.bgDisabled }
		}
	}
}
