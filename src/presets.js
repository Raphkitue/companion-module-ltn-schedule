exports.initPresets = function () {
	const presets = []
	const pstSize = '18'
	const self = this
	self.data.targets
		.map((target) => {
			return {
				category: 'Push Targets',
				label: target.label,
				bank: {
					style: 'text',
					text: target.label,
					size: pstSize,
					color: '16777215',
					bgcolor: self.rgb(0, 0, 0),
				},
				actions: [
					{
						action: 'targets_toggle',
						options: {
							targetsSelect: [target.id],
						},
					},
				],
				feedbacks: [
					{
						type: 'targetsStatus',
						options: {
							targets: [target.id],
						},
					},
				],
			}
		})
		.forEach((element) => {
			presets.push(element)
		})

	presets.push({
		category: 'Commands',
		label: 'Toggle Playback',
		bank: {
			style: 'text',
			text: 'Toggle playback',
			size: pstSize,
			color: '16777215',
			bgcolor: self.rgb(91, 198, 233),
		},
		actions: [
			{
				action: 'playback_toggle',
				options: {
					startstamp: 0,
				},
			},
		],
		feedbacks: [
			{
				type: 'playbackStatus',
				style: {
					bgcolor: self.rgb(231, 88, 59),
				}
			},
		],
	})

	presets.push({
		category: 'Commands',
		label: 'Toggle Publish',
		bank: {
			style: 'text',
			text: 'Toggle publish',
			size: pstSize,
			color: '16777215',
			bgcolor: self.rgb(0, 0, 0),
		},
		actions: [
			{
				action: 'publish_toggle',
			},
		],
		feedbacks: [
			{
				type: 'publishStatus',
			},
		],
	})

	presets.push({
		category: 'Commands',
		label: 'Skip element',
		bank: {
			style: 'text',
			text: 'Skip element',
			size: pstSize,
			color: '16777215',
			bgcolor: self.rgb(0, 0, 0),
		},
		actions: [
			{
				action: 'playback_skip',
				options: {
					strategy: 'snap',
				},
			},
		],
		feedbacks: [
			{
				type: 'skippableStatus',
			},
		],
	})

	presets.push({
		category: 'Commands',
		label: 'Trigger ad',
		bank: {
			style: 'text',
			text: 'Trigger ad',
			size: pstSize,
			color: '16777215',
			bgcolor: self.rgb(0, 0, 0),
		},
		actions: [
			{
				action: 'playback_ad',
				options: {
					adLength: '30',
				},
			},
		],
		feedbacks: [
			{
				type: 'adTriggerStatus',
			},
		],
	})

	if (self.data.apiVersion > 1) {
		presets.push({
			category: 'Commands',
			label: 'Toggle Breaking News',
			bank: {
				style: 'text',
				text: 'Toggle Breaking News',
				size: pstSize,
				color: '16777215',
				bgcolor: self.rgb(91, 198, 233),
			},
			actions: [
				{
					action: 'breaking_news',
				},
			],
			feedbacks: [
				{
					type: 'breakingNewsStatus',
					style: {
						bgcolor: self.rgb(231, 88, 59),
					}
				},
			],
		})
	}
	

	self.setPresetDefinitions(presets)
}
