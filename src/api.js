import WebSocket from 'ws'

export function initAPI() {
	if (this.socket) {
		this.socket.close()
		delete this.socket
	}

	const retrySocket = () => {
		const ws = this.socket

		// ping server every 15 seconds to keep connection open
		try {
			// readyState 2 = CLOSING, readyState 3 = CLOSED
			if (!ws || ws.readyState == 2 || ws.readyState == 3) {
				if (this.config.host && this.config.host !== '') {
					startListeningSocket()
				}
			}
			// readyState 1 = OPEN
			else if (ws.readyState == 1) {
				ws.send('keep alive')
			}
		} catch (err) {
			this.log('info', 'Error with handling socket' + JSON.stringify(err))
		}
	}

	/**
	 * Create a WebSocket connection for retrieving updates
	 */
	const startListeningSocket = () => {
		const url = 'wss://' + this.config.host + '/ws_admin'
		this.socket = new WebSocket(url, 'apisocket')
		const ws = this.socket
		this.socket.on('open', () => {
			ws.send(
				JSON.stringify({
					apiSocketMessageId: 'api_authenticate',
					username: this.config.username,
					password: this.config.password,
				})
			)
		})

		this.socket.on('message', (msg) => {
			const message = JSON.parse(msg)

			if (message.apiSocketMessageId === 'api_authenticate') {
				if (message.success) {
					this.updateStatus('ok', 'Connected & Authenticated')
					this.log('info', 'API Auth success')
					if (message.apiVersion === '1') {
						this.data.apiVersion = 1
					} else if (message.apiVersion === '2') {
						this.data.apiVersion = 2
					} else if (message.apiVersion === '3') {
						this.data.apiVersion = 3
					} else if (message.apiVersion === '4') {
						this.data.apiVersion = 4
					} else if (message.apiVersion === '5') {
						this.data.apiVersion = 5
					} else if (typeof message.apiVersion !== 'undefined') {
						this.data.apiVersion = Number.parseInt(message.apiVersion)
					} else {
						this.data.apiVersion = 0
					}
					this.updateElements()
				} else {
					this.updateStatus('bad_config', 'Authentication failed')
				}
			} else if (
				(message.messageId === 'pushTargetUpdate' || message._messageId === 'pushTargetUpdate') &&
				typeof message.pushTargetsList !== 'undefined'
			) {
				this.data.targets = []
				message.pushTargetsList.forEach((target) => {
					var localTarget = {}
					localTarget.id = target.id
					localTarget.label = target.targetName
					localTarget.enabled = target.enabled
					localTarget.status = target.status
					this.data.targets.push(localTarget)
				})
				this.actions()
				this.init_feedbacks()
				this.updatePresets()
				this.checkFeedbacks('targetsStatus')
			} else if (message.messageId === 'get_playout_settings') {
				if (this.data.apiVersion >= 5) {
					this.data.overlayEnabled = message.playoutSettings.overlayEnabled
					this.data.htmlOverlayEnabled = message.playoutSettings.html5OverlayEnabled
					this.data.breakingNewsCurrentId = message.playoutSettings.breakingLiveLivestreamId
				}
				this.checkFeedbacks('overlayStatus', 'htmlOverlayStatus', 'breakingNewsStatus', 'breakingLiveLivestreamStatus')
				this.updatePresets()
			} else if (message.messageId === 'playout_update' || message._messageId === 'playout_update') {
				if (this.data.apiVersion > 0) {
					this.data.playoutRunning = message.activated
				} else {
					this.data.playoutRunning = message.playoutRunning
				}
				this.data.publishRunning = message.publishRunning
				if (this.data.apiVersion > 1) {
					this.data.breakingNewsRunning = message.breakingNewsRunning
				}
				if (message.playoutItemIndex != -1) {
					if (this.data.apiVersion > 0) {
						this.data.currentItemType = message.currentItemType
					} else {
						this.data.currentItemType = message.playoutList[message.playoutItemIndex].type
					}
					if (this.data.apiVersion >= 5) {
						this.data.currentItemHeld = message.currentItemHeld
						this.data.hold = message.hold
					}
				}
				this.checkFeedbacks('playbackStatus', 'publishStatus', 'skippableStatus', 'adTriggerStatus', 'targetsStatus')

				if (this.data.apiVersion > 1) {
					this.checkFeedbacks('breakingNewsStatus')
				}
				if (this.data.apiVersion >= 5) {
					this.checkFeedbacks('holdStatus', 'breakingLiveLivestreamStatus')
				}
			} else if (message.messageId === 'ad_triggered' || message._messageId === 'ad_triggered') {
				this.data.adRunning = message.adLength
				if (this.adTimeout) {
					clearTimeout(this.adTimeout)
				}
				this.adTimeout = setTimeout(() => {
					this.data.adRunning = 0
					this.checkFeedbacks('adTriggerStatus')
				}, message.adLength * 1000)
				this.checkFeedbacks('adTriggerStatus')
			} else if (message.messageId === 'livestreamUpdate' || message._messageId === 'livestreamUpdate') {
				this.data.breakingNewsCurrentId = message.breakingNewsCurrentId
				this.data.livestreams = []
				message.livestreams.forEach((livestream) => {
					var localLivestream = {}
					localLivestream.id = livestream.id
					localLivestream.label = livestream.title
					this.data.livestreams.push(localLivestream)
				})
				this.actions()
				if (this.data.apiVersion >= 5) {
					this.updatePresets()
					this.init_feedbacks()
					this.checkFeedbacks('breakingLiveLivestreamStatus')
				}
			}
		})

		this.socket.on('onclose', () => {
			this.log('info', 'Server might have restarted')
		})

		this.socket.on('onerror', (err) => {
			this.updateStatusstatus('unknown_error', err)
			this.log('info', 'Schedule Websocket API err:' + JSON.stringify(err))
		})
	}

	this.pollApi = setInterval(retrySocket, 15000)
	retrySocket()
}
