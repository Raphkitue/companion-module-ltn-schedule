import { CreateConvertToBooleanFeedbackUpgradeScript, InstanceBase, runEntrypoint, combineRgb } from '@companion-module/base'

import { getActions } from './src/actions.js'
import { initAPI } from './src/api.js'
import { getConfigFields } from './src/config.js'
import { initFeedbacks } from './src/feedback.js'
import { updateVariableDefinitions } from './src/variables.js'
import { initPresets } from './src/presets.js'

export const lightBlue = combineRgb(91, 198, 233)
export const lightBlueDisabled = combineRgb(32, 92, 111)
export const darkGrey = combineRgb(27, 27, 27)
export const lightGrey = combineRgb(117, 117, 117)
export const green = combineRgb(93, 224, 130)
export const red = combineRgb(231, 88, 59)
export const black = combineRgb(255, 255, 255)

/**
 * Companion instance class for LTN Schedule
 */
class LTNScheduleInstance extends InstanceBase {
	
	constructor(internal) {
		super(internal)

		// Default instance state
		this.data = {
			playoutRunning: false,
			publishRunning: true,
			targets: [
				{
					id: 'fill',
					label: 'fill',
					enabled: true,
					status: 0,
				},
			],
			currentItemType: '',
			adRunning: 0,
			skipUsed: false,
			apiVersion: 0,
			breakingNewsRunning: false,
			breakingNewsCurrentId: '',
			livestreams: [
				{
					id: 'fill',
					title: 'fill',
				},
			],
			htmlOverlayEnabled: false,
			overlayEnabled: false,
			currentItemHeld: null,
			hold: false,
		}

	
		this.updateVariableDefinitions = updateVariableDefinitions
	}

	async init(config) {
		this.config = config

		this.config.host = config.host || ''
		this.config.username = config.username
		this.config.password = config.password

		this.updateStatus('connecting', 'Connecting')
		this.actions()
		initAPI.bind(this)()
		this.init_feedbacks()
		initPresets.bind(this)()
		this.updateVariableDefinitions()
	}

	// New config saved
	async configUpdated(config) {
		this.actions()
		this.config = config
		initAPI.bind(this)()
		this.init_feedbacks()
		initPresets.bind(this)()
	}

	updateElements() {
		this.actions()
		this.init_feedbacks()
		initPresets.bind(this)()
	}

	updatePresets() {
		initPresets.bind(this)()
	}

	// Set config page fields
	getConfigFields() {
		return getConfigFields.bind(this)()
	}

	// Instance removal clean up
	async destroy() {
		if (this.pollAPI) {
			clearInterval(this.pollAPI)
			delete this.pollAPI
		}

		if (this.socket) {
			this.socket.close()
			delete this.socket
		}
	}

	// Set available actions
	actions() {
		this.setActionDefinitions(getActions.bind(this)())
	}

	// Set available feedback choices
	init_feedbacks() {
		const feedbacks = initFeedbacks.bind(this)()
		this.setFeedbackDefinitions(feedbacks)
		this.checkFeedbacks('playbackStatus')
		this.checkFeedbacks('targetsStatus')
	}
}

runEntrypoint(LTNScheduleInstance, [
	CreateConvertToBooleanFeedbackUpgradeScript({
		playbackStatus: true,
	}),
])
