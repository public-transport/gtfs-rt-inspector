import { memoize, debounce, pick } from 'lodash-es';

const qs = {
	parse: (str) => Object.fromEntries(str.split('&').map(i => i.split('=').map(decodeURIComponent))),
	stringify: (obj) => Object.entries(obj).map(e => e.map(encodeURIComponent).join('=')).join('&'),
}

const qsParse = memoize(qs.parse)

const decodeString = str => str
const decodeBoolean = str => str === 'true'
const decodeFloat = str => parseFloat(str)
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
	// stores/map-state
	'mapZoom': {
		decode: decodeFloat,
		apply: (mapZoom, bus) => !isNaN(mapZoom) && bus.emit('map-state:set', { mapZoom }),
	},
	'mapLng': {
		decode: decodeFloat,
		apply: (mapLng, bus) => !isNaN(mapLng) && bus.emit('map-state:set', { mapLng }),
	},
	'mapLat': {
		decode: decodeFloat,
		apply: (mapLat, bus) => !isNaN(mapLat) && bus.emit('map-state:set', { mapLat }),
	},
}

const pluckState = (state) => {
	return pick(state, Object.keys(PERSISTED_STATE_FIELDS))
}

export const urlStore = (state, bus) => {
	const applyState = (pluckedState) => {
		for (const [key, encoded] of Object.entries(pluckedState)) {
			const { decode, apply } = PERSISTED_STATE_FIELDS[key]
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
		const newLocSearch = '?' + qs.stringify(mergedQuerystring)

		// abort if nothing changed
		if (newLocSearch === location.search) return;
		history.replaceState(pluckedState, '_', newLocSearch)
	}, 200, { leading: true })
	bus.on(bus.STATE_CHANGE, updateQueryStringWithState)

	const initialState = pluckState(qsParse(location.search.slice(1)))
	applyState(initialState)
}
