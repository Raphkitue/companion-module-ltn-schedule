import { combineRgb } from '@companion-module/base'
import { lightBlue, lightBlueDisabled, darkGrey, lightGrey, green, red, black, yellow } from '../index.js'

export function initPresets() {
	const presets = {}
	const pstSize = '18'
	this.data.targets
		.map((target) => {
			return {
				id: target.id,
				type: 'button',
				category: 'Push Targets',
				name: target.label,
				options: {},
				style: {
					text: target.label,
					size: pstSize,
					color: '16777215',
					bgcolor: combineRgb(0, 0, 0),
				},
				steps: [
					{
						down: [
							{
								actionId: 'targets_toggle',
								options: {
									targetsSelect: [target.id],
								},
							},
						],
						up: [],
					},
				],
				feedbacks: [
					{
						feedbackId: 'targetsStatus',
						options: {
							targets: [target.id],
							fg: black,
							bgDisabled: darkGrey,
							bgEnabled: lightGrey,
							bgPushing: green,
							bgPushingProblem: red,
						},
					},
				],
			}
		})
		.forEach((element) => {
			presets[element.id] = element
		})

	presets.toggle_playback = {
		category: 'Commands',
		type: 'button',
		name: 'Toggle Playback',
		options: {},
		style: {
			text: 'Toggle playback',
			size: pstSize,
			color: '16777215',
			bgcolor: combineRgb(91, 198, 233),
		},
		steps: [
			{
				down: [
					{
						actionId: 'playback_toggle',
						options: {
							startstamp: 0,
						},
					},
				],
				up: [],
			},
		],
		feedbacks: [
			{
				feedbackId: 'playbackStatus',
				style: {
					bgcolor: combineRgb(231, 88, 59),
				},
				options: {},
			},
		],
	}

	presets.toggle_publish = {
		category: 'Commands',
		type: 'button',
		name: 'Toggle Publish',
		options: {},
		style: {
			text: 'Toggle publish',
			size: pstSize,
			color: '16777215',
			bgcolor: combineRgb(0, 0, 0),
		},
		steps: [
			{
				down: [
					{
						actionId: 'publish_toggle',
						options: {},
					},
				],
				up: [],
			},
		],
		feedbacks: [
			{
				feedbackId: 'publishStatus',
				options: {
					fg: black,
					bgDisabled: lightBlueDisabled,
					bgEnabled: lightBlue,
					bgPushing: red,
				},
			},
		],
	}

	var skipFeedbacks = []

	skipFeedbacks.push({
		feedbackId: 'skippableStatus',
		options: {
			fg: black,
			bgDisabled: darkGrey,
			bgEnabled: lightBlue,
			bgSkipped: green,
		},
	})

	if (this.data.apiVersion >= 6) {
		skipFeedbacks.push({
			feedbackId: 'nextElementUnavailable',
			style: {
				bgcolor: red,
			},
			options: {},
		})
		skipFeedbacks.push({
			feedbackId: 'nextElementCaching',
			style: {
				bgcolor: yellow,
			},
			options: {},
		})
	}

	presets.skip_element = {
		category: 'Commands',
		type: 'button',
		name: 'Skip element',
		options: {},
		style: {
			text: 'Skip element',
			size: pstSize,
			color: '16777215',
			bgcolor: combineRgb(0, 0, 0),
		},
		steps: [
			{
				down: [
					{
						actionId: 'playback_skip',
						options: {
							strategy: 'snap',
						},
					},
				],
				up: [],
			},
		],
		feedbacks: skipFeedbacks,
	}

	presets.trigger_ad = {
		category: 'Commands',
		type: 'button',
		name: 'Trigger ad',
		options: {},
		style: {
			text: 'Ad break',
			size: pstSize,
			color: '16777215',
			bgcolor: combineRgb(0, 0, 0),
		},
		steps: [
			{
				down: [
					{
						actionId: 'playback_ad',
						options: {
							adLength: '30',
						},
					},
				],
				up: [],
			},
		],
		feedbacks: [
			{
				feedbackId: 'adTriggerStatus',
				options: {
					fg: black,
					bgDisabled: darkGrey,
					bgEnabled: lightBlue,
					bgPushing: green,
				},
			},
		],
	}

	var breakingNewsFeedbacks = []

	breakingNewsFeedbacks.push({
		feedbackId: 'playbackStatus',
		style: {
			bgcolor: lightBlue,
		},
		options: {},
	})

	breakingNewsFeedbacks.push({
		feedbackId: 'breakingNewsStatus',
		style: {
			bgcolor: red,
		},
		options: {},
	})

	if (this.data.apiVersion >= 7) {
		breakingNewsFeedbacks.push({
			feedbackId: 'breakingLiveBumperStatus',
			style: {
				bgcolor: yellow,
			},
			options: {},
		})
	}

	if (this.data.apiVersion > 1) {
		presets.toggle_breaking_news = {
			category: 'Commands',
			type: 'button',
			name: 'Toggle Breaking News',
			options: {},
			style: {
				text: 'Toggle Breaking News',
				size: pstSize,
				color: '16777215',
				bgcolor: darkGrey,
			},
			steps: [
				{
					down: [
						{
							actionId: 'breaking_news',
							options: {
								livestreamSelect: 'select',
								skipOnStop: false,
							},
						},
					],
					up: [],
				},
			],
			feedbacks: breakingNewsFeedbacks,
		}
	}

	if (this.data.apiVersion > 3) {
		presets.cancel_ad = {
			category: 'Commands',
			type: 'button',
			name: 'Cancel ad',
			options: {},
			style: {
				text: 'Cancel ad',
				size: pstSize,
				color: '16777215',
				bgcolor: combineRgb(0, 0, 0),
			},
			steps: [
				{
					down: [
						{
							actionId: 'cancel_ad',
							options: {},
						},
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'adTriggerStatus',
					options: {
						fg: black,
						bgDisabled: darkGrey,
						bgEnabled: lightBlue,
						bgPushing: green,
					},
				},
			],
		}
	}

	if (this.data.apiVersion >= 5) {
		presets.toggle_overlay = {
			category: 'Commands',
			type: 'button',
			name: 'Toggle PNG Overlay',
			options: {},
			style: {
				text: 'Toggle PNG Overlay',
				size: pstSize,
				color: '16777215',
				bgcolor: lightBlueDisabled,
			},
			steps: [
				{
					down: [
						{
							actionId: 'toggle_overlay',
							options: {},
						},
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'overlayStatus',
					style: {
						bgcolor: lightBlue,
					},
					options: {},
				},
			],
		}

		presets.toggle_html_overlay = {
			category: 'Commands',
			type: 'button',
			name: 'Toggle HTML Overlay',
			options: {},
			style: {
				text: 'Toggle HTML Overlay',
				size: pstSize,
				color: '16777215',
				bgcolor: lightBlueDisabled,
			},
			steps: [
				{
					down: [
						{
							actionId: 'toggle_html_overlay',
							options: {},
						},
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'htmlOverlayStatus',
					style: {
						bgcolor: lightBlue,
					},
					options: {},
				},
			],
		}

		presets.toggle_hold = {
			category: 'Commands',
			type: 'button',
			name: 'Toggle hold property',
			options: {},
			style: {
				text: 'Toggle hold',
				size: pstSize,
				color: '16777215',
				bgcolor: combineRgb(0, 0, 0),
			},
			steps: [
				{
					down: [
						{
							actionId: 'toggle_hold',
							options: {},
						},
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'holdStatus',
					options: {
						fg: black,
						bgDisabled: darkGrey,
						bgRunningEnabled: lightBlue,
						bgRunningDisabled: lightBlueDisabled,
						bgHolding: green,
					},
				},
			],
		}

		this.data.livestreams
			.map((live) => {
				var liveFeedback = []

				liveFeedback.push({
					feedbackId: 'playbackStatus',
					style: {
						bgcolor: lightBlue,
					},
					options: {},
				})

				liveFeedback.push({
					feedbackId: 'breakingLiveLivestreamStatus',
					style: {
						bgcolor: red,
					},
					options: {
						livestreamSelect: live.id,
					},
				})

				if (this.data.apiVersion >= 7) {
					liveFeedback.push({
						feedbackId: 'breakingLiveBumperStatus',
						style: {
							bgcolor: yellow,
						},
						options: {},
					})
				}

				return {
					category: 'Breaking Live',
					type: 'button',
					name: `BL ${live.label}`,
					options: {},
					style: {
						text: `BL ${live.label}`,
						size: pstSize,
						color: '16777215',
						bgcolor: darkGrey,
					},
					steps: [
						{
							down: [
								{
									actionId: 'breaking_news',
									options: {
										livestreamSelect: live.id,
									},
								},
							],
							up: [],
						},
					],
					feedbacks: liveFeedback,
				}
			})
			.forEach((element) => {
				presets[element.name] = element
			})
	}

	if (this.data.apiVersion >= 6) {
		presets.insert_template = {
			category: 'Templates',
			type: 'button',
			name: `Insert template`,
			options: {},
			style: {
				text: `Insert template`,
				size: pstSize,
				color: '16777215',
				bgcolor: green,
			},
			steps: [
				{
					down: [
						{
							actionId: 'insert_template',
							options: {
								templatesSelect: 'select',
								insertSelect: 'next',
								conflictSelect: 'nothing',
								skipOnReady: false,
							},
						},
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'templateInsertStatus',
					style: {
						bgcolor: yellow,
					},
					options: {
						insertStatus: '1',
					},
				},
				{
					feedbackId: 'templateInsertStatus',
					style: {
						bgcolor: red,
					},
					options: {
						insertStatus: '2',
					},
				},
			],
		}
	}

	if (this.data.apiVersion >= 7) {
		presets.sync_status = {
			category: 'Commands',
			type: 'button',
			name: `Sync status`,
			options: {},
			style: {
				text: `Sync`,
				size: pstSize,
				color: '16777215',
				bgcolor: darkGrey,
			},
			steps: [
				{
					down: [
						{
							actionId: 'resync',
							options: {},
						},
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'syncStatus',
					options: {
						fg: black,
						bgUninitialized: darkGrey,
						bgCatchingUp: yellow,
						bgSynced: green,
						bgError: red,
					},
				},
			],
		}

		presets.total_remaining_time = {
			category: 'Timers',
			type: 'button',
			name: `Total Remaining Time`,
			options: {},
			style: {
				text: `Remaining time\n$(generic-module:totalRemainingTime)`,
				size: 11,
				color: lightBlue,
				bgcolor: darkGrey,
			},
			steps: [
				{
					down: [],
					up: [],
				},
			],
			feedbacks: [],
		}

		presets.total_played_time = {
			category: 'Timers',
			type: 'button',
			name: `Total Played Time`,
			options: {},
			style: {
				text: `Played time\n$(generic-module:totalPlayedTime)`,
				size: 11,
				color: green,
				bgcolor: darkGrey,
			},
			steps: [
				{
					down: [],
					up: [],
				},
			],
			feedbacks: [],
		}

		presets.current_remaining_time = {
			category: 'Timers',
			type: 'button',
			name: `Current Remaining Time`,
			options: {},
			style: {
				text: `Element time\n$(generic-module:currentRemainingTime)`,
				size: 11,
				color: red,
				bgcolor: darkGrey,
			},
			steps: [
				{
					down: [],
					up: [],
				},
			],
			feedbacks: [],
		}

		presets.total_duration = {
			category: 'Timers',
			type: 'button',
			name: `Total Duration`,
			options: {},
			style: {
				text: `Total duration\n$(generic-module:totalDuration)`,
				size: 11,
				color: '16777215',
				bgcolor: darkGrey,
			},
			steps: [
				{
					down: [],
					up: [],
				},
			],
			feedbacks: [],
		}

		presets.ad_remaining_time = {
			category: 'Timers',
			type: 'button',
			name: `Ad break remaining time`,
			options: {},
			style: {
				text: `$(generic-module:adRemainingTime)`,
				size: pstSize,
				color: '16777215',
				bgcolor: darkGrey,
			},
			steps: [
				{
					down: [],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'adTriggerStatus',
					options: {
						fg: black,
						bgDisabled: darkGrey,
						bgEnabled: lightBlue,
						bgPushing: green,
					},
				},
			],
		}
	}

	if (this.data.apiVersion >= 8) {
		presets.jump_to_id = {
			category: 'Commands',
			type: 'button',
			name: `Jump to ID`,
			options: {},
			style: {
				text: `Jump to ID`,
				size: pstSize,
				color: '16777215',
				bgcolor: darkGrey,
			},
			steps: [
				{
					down: [{
						actionId: 'jumpTo',
						options: {
							id: "id to fill",
						},
					}
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'flexiblePlaybackStatus',
					style: {
						bgcolor: green,
					},
					options: {},
				},
				{
					feedbackId: 'playedElementStatus',
					style: {
						bgcolor: red,
					},
					options: {
						id: 'id to fill',
					},
				},
			],
		}

		presets.jump_to_index = {
			category: 'Commands',
			type: 'button',
			name: `Jump to Index`,
			options: {},
			style: {
				text: `Jump to Index`,
				size: pstSize,
				color: '16777215',
				bgcolor: darkGrey,
			},
			steps: [
				{
					down: [{
						actionId: 'jumpTo',
						options: {
							index: '0',
						},
					}],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'flexiblePlaybackStatus',
					style: {
						bgcolor: green,
					},
					options: {},
				},
				{
					feedbackId: 'playedElementStatus',
					style: {
						bgcolor: red,
					},
					options: {
						index: '0',
					},
				},
			],
		}
	}

	this.setPresetDefinitions(presets)
}
