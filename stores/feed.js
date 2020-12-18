import {debounce} from 'lodash'
import * as syncViaPeriodicFetch from 'fetch-periodic-sync'

const feedStore = (state, bus) => {
	state.feedUrl = null
	state.feedSyncing = false
	let sync = null

	const setSyncing = (syncing) => {
		state.feedSyncing = syncing
		bus.emit('render')
	}
	const resetSync = debounce(() => {
		sync = syncViaPeriodicFetch(state.feedUrl, {
			interval: 30 * 1000, // 30s
		})
		sync.on('fetch', () => setSyncing(true))
		sync.on('fetch-done', () => setSyncing(false))
		// todo: error
	}, 100)

	bus.on('feed:set-url', (url) => {
		if (url === state.feedUrl) return; // nothing changed, abort

		// clean up
		if (sync) {
			sync.stop()
			sync = null
		}

		state.feedUrl = url
		state.feedSyncing = false
		if (url !== null) resetSync()

		bus.emit('render')
	})

	bus.on('feed:sync', () => {
		if (!sync) return;
		sync.refetch()
	})
}

export default feedStore
