import got from 'got'
import FormData from 'form-data'

export function getActions() {
	var skipOption = {}
	if (this.data.apiVersion > 0) {
		skipOption = {
			type: 'dropdown',
			multiple: false,
			label: 'Skip strategy',
			id: 'strategy',
			tooltip: 'What do you want the skipping behavior to be?',
			default: 'snap',
			choices: [
				{ id: 'snap', label: 'Move all the following assets' },
				{ id: 'fix_next', label: 'Skip to the next asset, and creates a gap after it' },
			],
		}
	}

	var breakingNewsOptions = []
	if (this.data.apiVersion > 2) {
		breakingNewsOptions.push({
			type: 'dropdown',
			label: 'Live streams',
			id: 'livestreamSelect',
			tooltip: 'What livestream do you want to use?',
			default: 'select',
			choices: this.data.livestreams.concat({ id: 'select', label: 'Select a target' }),
		})
	}
	if (this.data.apiVersion >= 5) {
		breakingNewsOptions.push({
			id: 'skipOnStop',
			type: 'checkbox',
			label: 'Skip when stopping breaking news',
			default: false,
		})
	}

	var actions = {
		playback_toggle: {
			name: 'Toggle playback running',
			options: [
				{
					type: 'number',
					label: 'Start timestamp',
					id: 'startstamp',
					tooltip: 'Sets the start timestamp (in milliseconds) (optional)',
					min: 0,
					required: false,
					range: false,
				},
			],
			callback: async (event) => {
				var opt = event.options
				var cmd
				var apiEndpoint

				if (this.data.playoutRunning) {
					apiEndpoint = 'playout/stop'
					cmd = ''
				} else {
					apiEndpoint = 'playout/start'
					if (opt.startstamp != '' && opt.startstamp != 0) {
						cmd = '?timestamp=' + opt.startstamp
					} else {
						cmd = '?timestamp=NOW'
					}
				}
				sendAction.bind(this)(apiEndpoint, cmd)
			},
		},
		publish_toggle: {
			name: 'Toggle publishing',
			options: [],
			callback: async (event) => {
				var cmd
				var apiEndpoint

				if (this.data.playoutRunning) {
					if (this.data.publishRunning) {
						apiEndpoint = 'playout/unpublish'
						cmd = ''
					} else {
						apiEndpoint = 'playout/publish'
						cmd = ''
					}
				}
				sendAction.bind(this)(apiEndpoint, cmd)
			},
		},
		targets_toggle: {
			name: 'Toggle push targets',
			options: [
				{
					type: 'multidropdown',
					multiple: true,
					minSelection: 1,
					label: 'Push Targets',
					id: 'targetsSelect',
					tooltip: 'What push targets do you want to toggle?',
					default: 'select',
					choices: this.data.targets.concat({ id: 'select', label: 'Select a target' }),
				},
			],
			callback: async (event) => {
				var opt = event.options
				var cmd
				var apiEndpoint

				var actualSelectedTargets = opt.targetsSelect.filter((target) => target !== 'select')
				var someDisabled = this.data.targets
					.filter((target) => actualSelectedTargets.some((selected) => selected === target.id))
					.some((target) => !target.enabled)

				if (actualSelectedTargets.length > 0) {
					if (someDisabled) {
						apiEndpoint = 'targets/start'
					} else {
						apiEndpoint = 'targets/stop'
					}
					cmd = '?id=' + actualSelectedTargets.join('&id=')
				}
				sendAction.bind(this)(apiEndpoint, cmd)
			},
		},
		playback_skip: {
			name: 'Skip a playback element',
			options: [skipOption],
			callback: async (event) => {
				var opt = event.options
				var cmd
				var apiEndpoint

				if (!this.data.skipUsed) {
					apiEndpoint = 'playout/skip'
					if (this.data.apiVersion > 0) {
						cmd = '?strategy=' + opt.strategy
					} else {
						cmd = ''
					}

					this.data.skipUsed = true
					setTimeout(() => {
						this.data.skipUsed = false
						this.checkFeedbacks('skippableStatus')
					}, 2000)
					this.checkFeedbacks('skippableStatus')
				}
				sendAction.bind(this)(apiEndpoint, cmd)
			},
		},
		playback_ad: {
			name: 'Trigger an ad',
			options: [
				{
					type: 'number',
					label: 'Ad Length',
					id: 'adLength',
					tooltip: 'Sets the ad length (in seconds)',
					min: 0,
					max: 3600,
					default: 0,
					required: true,
					range: false,
				},
			],
			callback: async (event) => {
				var opt = event.options
				var cmd
				var apiEndpoint

				if (
					this.data.adRunning == 0 &&
					this.data.playoutRunning &&
					(this.data.currentItemType === 'livestream' || this.data.apiVersion > 3)
				) {
					apiEndpoint = 'playout/ad'
					cmd = '?adLength=' + opt.adLength
				}
				sendAction.bind(this)(apiEndpoint, cmd)
			},
		},
	}

	if (this.data.apiVersion == 2) {
		actions.breaking_news = {
			name: 'Toggle breaking live',
			options: [],
			callback: async (event) => {
				var opt = event.options
				var cmd
				var apiEndpoint

				if (!this.data.breakingNewsRunning) {
					apiEndpoint = 'breakinglive/start'
					cmd = ''
				} else {
					apiEndpoint = 'breakinglive/stop'
					cmd = ''
				}
				sendAction.bind(this)(apiEndpoint, cmd)
			},
		}
	} else if (this.data.apiVersion > 2) {
		actions.breaking_news = {
			name: 'Toggle breaking live',
			options: breakingNewsOptions,
			callback: async (event) => {
				var opt = event.options
				var cmd
				var apiEndpoint

				if (this.data.bumperRunning && this.data.apiVersion >= 7) {
					apiEndpoint = 'breakinglive/cancelbumper'
					cmd = ''
				} else if (
					!this.data.breakingNewsRunning ||
					(this.data.apiVersion >= 5 &&
						opt.livestreamSelect !== 'select' &&
						this.data.breakingNewsCurrentId !== opt.livestreamSelect)
				) {
					apiEndpoint = 'breakinglive/start'
					cmd = ''
					if (opt.livestreamSelect !== 'select') {
						cmd = '?breakingliveId=' + opt.livestreamSelect
					}
				} else {
					apiEndpoint = 'breakinglive/stop'
					cmd = ''
					if (this.data.apiVersion >= 5 && typeof opt.skipOnStop !== 'undefined') {
						cmd = '?skip=' + opt.skipOnStop
					}
				}

				sendAction.bind(this)(apiEndpoint, cmd)
			},
		}
	}

	if (this.data.apiVersion > 3) {
		actions.cancel_ad = {
			name: 'Cancel an ad',
			options: [],
			callback: async (event) => {
				var cmd
				var apiEndpoint

				apiEndpoint = 'playout/cancelad'
				cmd = ''

				sendAction.bind(this)(apiEndpoint, cmd)
			},
		}
	}

	if (this.data.apiVersion >= 5) {
		actions.toggle_overlay = {
			name: 'Toggle overlay',
			options: [],
			callback: async (event) => {
				var cmd
				var apiEndpoint
				var type

				if (!this.data.overlayEnabled) {
					apiEndpoint = 'overlay/static/activate'
					cmd = ''
					type = 'POST'
				} else {
					apiEndpoint = 'overlay/static/deactivate'
					cmd = ''
					type = 'GET'
				}

				sendAction.bind(this)(apiEndpoint, cmd, null, null, type)
			},
		}

		actions.toggle_html_overlay = {
			name: 'Toggle HTML overlay',
			options: [
				{
					id: 'overlayUrl',
					type: 'textinput',
					label: 'Url of the overlay',
					requred: false,
					default: '',
				},
			],
			callback: async (event) => {
				var opt = event.options
				var cmd
				var apiEndpoint

				if (!this.data.htmlOverlayEnabled) {
					apiEndpoint = 'overlay/html/activate'
					cmd = ''
				} else {
					apiEndpoint = 'overlay/html/deactivate'
					cmd = ''
				}

				if (typeof opt.overlayUrl !== 'undefined' && opt.overlayUrl !== '') {
					cmd = '?url=' + opt.overlayUrl
				}

				sendAction.bind(this)(apiEndpoint, cmd)
			},
		}

		actions.toggle_hold = {
			name: 'Toggle hold property',
			description: 'Toggle hold property of the currently running element',
			options: [],
			callback: async (event) => {
				sendAction.bind(this)('playout/hold', '', (result) => {
					this.data.currentItemHeld = result.currentIsHeld
				})
			},
		}
	}

	if (this.data.apiVersion >= 6) {
		actions.insert_template = {
			name: 'Insert template',
			options: [
				{
					type: 'dropdown',
					label: 'Templates',
					id: 'templatesSelect',
					tooltip: 'What template do you want to insert?',
					default: 'select',
					choices: this.data.templates.concat({ id: 'select', label: 'Select a template' }),
				},
				{
					type: 'dropdown',
					label: 'Insert position',
					id: 'insertSelect',
					tooltip: 'Where do you want to insert the template?',
					default: 'next',
					choices: [
						{
							id: 'next',
							label: 'Next in rundown',
						},
						{
							id: 'end',
							label: 'End of rundown',
						},
					],
				},
				{
					type: 'dropdown',
					label: 'Conflict resolution',
					id: 'conflictSelect',
					tooltip: 'How do you want to resolve conflicts?',
					default: 'nothing',
					choices: [
						{
							id: 'move',
							label: 'Move all following elements',
						},
						{
							id: 'overwrite',
							label: 'Overwrite present elements',
						},
						{
							id: 'nothing',
							label: 'Do not resolve conflicts',
						},
					],
				},
				{
					type: 'checkbox',
					label: 'Skip once template is inserted',
					id: 'skipOnReady',
					default: false,
				},
			],
			callback: async (event) => {
				var opt = event.options
				var cmd

				cmd =
					'?id=' +
					opt.templatesSelect +
					'&insertPosition=' +
					opt.insertSelect +
					'&conflict=' +
					opt.conflictSelect +
					'&skipOnReady=' +
					opt.skipOnReady

				sendAction.bind(this)(
					'template/insert',
					cmd,
					() => {
						if (opt.skipOnReady) {
							this.data.templateInsertStatus = 1
							this.checkFeedbacks('templateInsertStatus')
							if (this.templateTimeout) {
								clearTimeout(this.templateTimeout)
							}
						} else {
							this.data.templateInsertStatus = 1
							this.checkFeedbacks('templateInsertStatus')
							if (this.templateTimeout) {
								clearTimeout(this.templateTimeout)
							}
							this.templateTimeout = setTimeout(() => {
								this.data.templateInsertStatus = 0
								this.checkFeedbacks('templateInsertStatus')
							}, 1000)
						}
					},
					() => {
						this.data.templateInsertStatus = 2
						this.checkFeedbacks('templateInsertStatus')
						if (this.templateTimeout) {
							clearTimeout(this.templateTimeout)
						}
						this.templateTimeout = setTimeout(() => {
							this.data.templateInsertStatus = 0
							this.checkFeedbacks('templateInsertStatus')
						}, 1000)
					},
					'POST'
				)
			},
		}
	}

	if (this.data.apiVersion >= 7) {
		actions.resync = {
			name: 'Resync systems',
			options: [],
			callback: async (event) => {
				var cmd
				var apiEndpoint

				apiEndpoint = 'playout/resync'
				cmd = ''

				sendAction.bind(this)(apiEndpoint, cmd)
			},
		}
	}

	if (this.data.apiVersion >= 8) {
		actions.jumpTo = {
			name: 'Jump to an element',
			options: [
				{
					id: 'id',
					type: 'textinput',
					label: 'Element Id',
				},
				{
					id: 'index',
					type: 'number',
					label: 'Element Index',
				}
			],
			callback: async (event) => {
				var cmd
				var apiEndpoint
				var opt = event.options

				apiEndpoint = 'playout/jump'
				if (opt.id) {
					cmd = '?id=' + opt.id
				}
				else {
					cmd = '?index=' + opt.index
				}

				sendAction.bind(this)(apiEndpoint, cmd, null, null, 'POST')
			},
		}
	}

	return actions
}

function sendAction(apiEndpoint, cmd, callback, errorCallback, requestType) {
	if (typeof cmd !== 'undefined' && typeof apiEndpoint !== 'undefined') {
		var requestString =
			`https://${this.config.username}:${this.config.password}@${this.config.host}/api/v1/${apiEndpoint}` + cmd
		this.log('info', `request ${requestString}`)
		var req
		if (requestType === 'POST') {
			var formData = new FormData()
			req = got.post(requestString, { body: formData })
		} else {
			req = got.get(requestString)
		}

		req
			.then((res) => {
				if (res.statusCode === 200 && callback != null) {
					callback.bind(this)(JSON.parse(res.body))
				} else if (res.statusCode !== 200 && errorCallback != null) {
					errorCallback.bind(this)()
				}
			})
			.catch((err) => {
				this.updateStatus('connection_failure', err)
				this.log('info', 'Schedule API err:' + err)
				if (errorCallback != null) {
					errorCallback.bind(this)()
				}
			})
	}
}
