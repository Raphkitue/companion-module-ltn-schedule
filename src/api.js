const WebSocket = require('ws')

exports.initAPI = function () {
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
			this.debug('Error with handling socket' + JSON.stringify(err))
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

			this.debug('Listener WebSocket Opened')
		})

		this.socket.on('message', (msg) => {
			const message = JSON.parse(msg)

			if (message.apiSocketMessageId === 'api_authenticate') {
				if (message.success) {
					this.status(this.STATUS_OK, 'Connected & Authenticated')
					this.debug('API Auth success')
					if (message.apiVersion === '1') {
						this.data.apiVersion = 1
					} else if (message.apiVersion === '2')
					{
						this.data.apiVersion = 2
						this.updateElements()
					}
					else {
						this.data.apiVersion = 0
					}
				} else {
					this.status(this.STATUS_ERROR, 'Authentication failed')
					this.log('Schedule API auth error')
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
			} else if (message.messageId === 'playout_update' || message._messageId === 'playout_update') {
				if (this.data.apiVersion > 0) {
					this.data.playoutRunning = message.activated
				} else {
					this.data.playoutRunning = message.playoutRunning
				}
				this.data.publishRunning = message.publishRunning
				if (this.data.apiVersion > 1)
				{
					this.data.breakingNewsRunning = message.breakingNewsRunning
				}
				if (message.playoutItemIndex != -1) {
					if (this.data.apiVersion > 0) {
						this.data.currentItemType = message.currentItemType
					} else {
						this.data.currentItemType = message.playoutList[message.playoutItemIndex].type
					}
				}
				this.checkFeedbacks('playbackStatus')
				this.checkFeedbacks('publishStatus')
				this.checkFeedbacks('skippableStatus')
				this.checkFeedbacks('adTriggerStatus')
				this.checkFeedbacks('targetsStatus')
				if(this.data.apiVersion > 1) {
					this.checkFeedbacks('breakingNewsStatus')
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
			}
		})

		this.socket.on('onclose', () => {
			this.debug('Server might have restarted')
		})

		this.socket.on('onerror', (err) => {
			this.status(this.STATUS_ERROR, err)
			this.debug('Schedule Websocket API err:' + JSON.stringify(err))
		})
	}

	this.pollApi = setInterval(retrySocket, 15000)
	retrySocket()
}
