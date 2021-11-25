const got = require('got')

exports.getActions = function () {
	var self = this
	var skipOption = {}
	if (self.data.apiVersion > 0) {
		skipOption = {
			type: 'dropdown',
			multiple: false,
			minSelection: 1,
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
	var actions = {
		playback_toggle: {
			label: 'Toggle playback running',
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
		},
		publish_toggle: {
			label: 'Toggle publishing',
		},
		targets_toggle: {
			label: 'Toggle push targets',
			options: [
				{
					type: 'dropdown',
					multiple: true,
					minSelection: 1,
					label: 'Push Targets',
					id: 'targetsSelect',
					tooltip: 'What push targets do you want to toggle?',
					default: 'select',
					choices: self.data.targets.concat({ id: 'select', label: 'Select a target' }),
				},
			],
		},
		playback_skip: {
			label: 'Skip a playback element',
			options: [skipOption],
		},
		playback_ad: {
			label: 'Trigger an ad',
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
		},
	}

	if (self.data.apiVersion > 1) {
		actions.breaking_news = {
			label: 'Toggle breaking news',
		}
	}

	return actions
}

exports.executeAction = function (action) {
	var opt = action.options
	var cmd
	var apiEndpoint

	switch (action.action) {
		case 'playback_toggle':
			if (this.data.playoutRunning) {
				apiEndpoint = 'playout/stop'
				cmd = ''
			} else {
				apiEndpoint = 'playout/start'
				if (opt.startstamp != "" && opt.startstamp != 0) {
					cmd = '?timestamp=' + opt.startstamp
				} else {
					cmd = '?timestamp=NOW'
				}
			}
			break
		case 'publish_toggle':
			if (this.data.playoutRunning) {
				if (this.data.publishRunning) {
					apiEndpoint = 'playout/unpublish'
					cmd = ''
				} else {
					apiEndpoint = 'playout/publish'
					cmd = ''
				}
			}
			break
		case 'breaking_news':
			if (!this.data.breakingNewsRunning) {
					apiEndpoint = 'breakingnews/start'
					cmd = ''
			}
			else {
					apiEndpoint = 'breakingnews/stop'
					cmd = ''
			}
			break
		case 'targets_toggle':
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
			break
		case 'playback_skip':
			if (!this.data.skipUsed) {
				apiEndpoint = 'playout/skip'
				if(this.data.apiVersion > 0){
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
			break
		case 'playback_ad':
			if (this.data.adRunning == 0 && this.data.playoutRunning && this.data.currentItemType === 'livestream') {
				apiEndpoint = 'playout/ad'
				cmd = '?adLength=' + opt.adLength
			}
	}

	if (typeof cmd !== 'undefined' && typeof apiEndpoint !== 'undefined') {
		var requestString =
			`https://${this.config.username}:${this.config.password}@${this.config.host}/api/v1/${apiEndpoint}` + cmd
		got
			.get(requestString)
			.then((res) => {
				if (res.statusCode === 200) {
					this.debug('API Call success')
				}
			})
			.catch((err) => {
				this.status(this.STATUS_ERROR, err)
				this.debug('Schedule API err:' + JSON.stringify(err))
			})
	}
}
