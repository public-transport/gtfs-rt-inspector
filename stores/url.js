import memoize from 'lodash/memoize'
import debounce from 'lodash/debounce'
import pick from 'lodash/pick'
import {parse as _qsParse, stringify as qsStringify} from 'query-string'

const qsParse = memoize(_qsParse)

const decodeString = str => str
const decodeBoolean = str => str === 'true'
const PERSISTED_STATE_FIELDS = {
	// stores/feed
	'feedUrl': {
		decode: decodeString,
		apply: (feedUrl, bus) => bus.emit('feed:set-url', feedUrl),
	},
	'feedSyncStopped': {
		decode: decodeBoolean,
		apply: (stopped, bus) => {
			bus.emit(`feed:${stopped ? 'stop' : 'start'}-sync`)
		},
	},
	// stores/view
	'view': {
		decode: decodeString,
		apply: (view, bus) => bus.emit('view:set', view),
	},
}

const pluckState = (state) => {
	return pick(state, Object.keys(PERSISTED_STATE_FIELDS))
}

const urlStore = (state, bus) => {
	const applyState = (pluckedState) => {
		for (const [key, encoded] of Object.entries(pluckedState)) {
			const {decode, apply} = PERSISTED_STATE_FIELDS[key]
			apply(decode(encoded), bus)
		}
		bus.emit(bus.STATE_CHANGE)
	}

	window.addEventListener('popstate', (ev) => {
		const oldPluckedState = pluckState(ev.state || {})
		applyState(oldPluckedState)
	})

	const updateQueryStringWithState = debounce(() => {
		// todo: use stable JSON encoder?
		const pluckedState = pluckState(state)
		const mergedQuerystring = {
			...qsParse(location.search.slice(1)),
			...pluckedState,
		}
		const newLocSearch = '?' + qsStringify(mergedQuerystring)

		// abort if nothing changed
		if (newLocSearch === location.search) return;
		history.replaceState(pluckedState, '_', newLocSearch)
	}, 500, {leading: true})
	bus.on(bus.STATE_CHANGE, updateQueryStringWithState)

	const initialState = pluckState(qsParse(location.search.slice(1)))
	setTimeout(applyState, 1, initialState)
}

export default urlStore
