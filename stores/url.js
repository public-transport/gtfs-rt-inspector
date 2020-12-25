import memoize from 'lodash/memoize'
import debounce from 'lodash/debounce'
import pick from 'lodash/pick'
import {parse as _qsParse, stringify as qsStringify} from 'query-string'

const qsParse = memoize(_qsParse)

const urlStore = (state, bus) => {
	window.addEventListener('popstate', (ev) => {
		const oldPluckedState = ev.state || {}
		Object.assign(state, oldPluckedState)
		bus.emit(bus.STATE_CHANGE)
	})

	const updateQueryStringWithState = debounce(() => {
		// todo: use stable JSON encoder?
		const pluckedState = pick(state, [
			// stores/feed
			'feedUrl',
			'feedSyncStopped',
			// stores/view
			'view',
		])
		const mergedQuerystring = {
			...qsParse(location.search.slice(1)),
			...pluckedState,
		}
		const newLocSearch = '?' + qsStringify(mergedQuerystring)

		// abort if nothing changed
		if (newLocSearch === location.search) return;
		history.replaceState(pluckedState, '_', newLocSearch)
	}, 200, {leading: true})
	bus.on(bus.STATE_CHANGE, updateQueryStringWithState)
}

export default urlStore
