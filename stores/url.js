import memoize from 'lodash/memoize'
import debounce from 'lodash/debounce'
import pick from 'lodash/pick'
import _queryString from 'query-string'
const {parse: _qsParse, stringify: qsStringify} = _queryString

const qsParse = memoize(_qsParse)

const decodeString = str => str
const decodeBoolean = str => str === 'true'
const decodeInteger = str => parseInt(str)
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
	'feedSyncInterval': {
		decode: decodeInteger,
		apply: (interval, bus) => {
			bus.emit('feed:set-sync-interval', interval)
		},
	},
	// stores/feed-log
	'feedLogFilter': {
		decode: decodeString,
		apply: (filter, bus) => bus.emit('feed-log:set-filter', filter),
	},
	// stores/inspector
	'inspectorFilter': {
		decode: decodeString,
		apply: (filter, bus) => bus.emit('inspector:set-filter', filter),
	},
	// stores/view
	'view': {
		decode: decodeString,
		apply: (view, bus) => bus.emit('view:set', view),
	},
	// stores/focus
	'shapeIdsByTripIdUrl': {
		decode: decodeString,
		apply: (url, bus) => bus.emit('shape-ids-by-trip-id-url:set', url),
	},
	'shapeUrl': {
		decode: decodeString,
		apply: (url, bus) => bus.emit('shape-url:set', url),
	},
	'focusedTripId': {
		decode: decodeString,
		apply: (tripId, bus) => bus.emit('focus-trip-id', tripId),
	},
	'focusedVehicleId': {
		decode: decodeString,
		apply: (vId, bus) => bus.emit('focus-vehicle-id', vId),
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
