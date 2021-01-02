import debounce from 'lodash/debounce'
import {parse as parseContentType} from 'content-type'
const {Buffer} = require('buffer/') // trailing slash is intentional
const {FeedMessage} = require('gtfs-rt-bindings')
import * as syncViaPeriodicFetch from 'fetch-periodic-sync'

const MAX_FEED_SIZE = 5 * 1024 * 1024 // 5mb

const CONTENT_TYPES = [
	'application/octet-stream', // generic "binary" blob
	'application/grtfeed', // used by TriMet
]

const feedStore = (state, bus) => {
	state.feedUrl = null
	state.feedSyncStopped = false
	state.feedSyncing = false
	state.feedRawData = null
	state.feedData = null
	let sync = null

	const receiveAndParseFeed = async (res) => {
		const cTypeHeader = res.headers.get('content-type')
		const cType = cTypeHeader ? parseContentType(cTypeHeader) : {}
		if (cType.type && !CONTENT_TYPES.includes(cType.type)) {
			const err = new Error(`invalid content-type \`${cType.type}\`, only ${CONTENT_TYPES.join(', ')} are supported`)
			err.response = res
			throw err
		}

		const size = res.headers.get('content-length')
		if (size && parseInt(size) > MAX_FEED_SIZE) {
			const err = new Error('response is too large')
			err.response = res
			throw err
		}

		const buf = Buffer.from(await res.arrayBuffer())
		const data = FeedMessage.decode(buf)
		if (!data || !data.header || !Array.isArray(data.entity)) {
			const err = new Error(`couldn't parse feed`)
			err.rawFeed = buf
			err.response = res
			throw err
		}

		state.feedRawData = buf
		state.feedData = data
		bus.emit('feed:data-change')
		bus.emit(bus.STATE_CHANGE)
	}

	const setSyncing = (syncing) => {
		state.feedSyncing = syncing
		bus.emit(bus.STATE_CHANGE)
	}
	const resetSync = debounce(() => {
		sync = syncViaPeriodicFetch(state.feedUrl, {
			interval: 30 * 1000, // 30s
		})
		sync.on('fetch', () => setSyncing(true))
		sync.on('fetch-done', () => setSyncing(false))
		sync.on('change', (res) => {
			receiveAndParseFeed(res)
			// todo: handle errors properly
			.catch(console.error)
		})
		if (state.feedSyncStopped) sync.stop()
		// todo: error
	}, 200)

	bus.on('feed:set-url', (url) => {
		if (url === state.feedUrl) return; // nothing changed, abort

		// clean up
		if (sync) {
			sync.stop()
			sync = null
		}

		state.feedUrl = url
		state.feedSyncing = false
		state.feedRawData = null
		state.feedData = null
		if (url !== null) resetSync()

		bus.emit('feed:data-change')
		bus.emit(bus.STATE_CHANGE)
	})

	bus.on('feed:sync', () => {
		if (!sync) return;
		sync.refetch()
	})
	bus.on('feed:stop-sync', () => {
		state.feedSyncStopped = true
		if (sync && sync.isActive()) sync.stop()
		bus.emit(bus.STATE_CHANGE)
	})
	bus.on('feed:start-sync', () => {
		state.feedSyncStopped = false
		if (sync && !sync.isActive()) sync.start()
		bus.emit(bus.STATE_CHANGE)
	})
}

export default feedStore
