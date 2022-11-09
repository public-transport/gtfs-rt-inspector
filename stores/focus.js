import AbortController from 'abort-controller'
import createFetch from 'fetch-ponyfill'
const {Request, fetch} = createFetch()
import {parseTemplate as parseUrlTemplate} from 'url-template'
// import pkg from '../package.json' assert {type: 'json'}

const hasProp = (o, k) => Object.prototype.hasOwnProperty.call(o, k)

const checkIfFeedContainsFocusedTripId = (feedData, focusedTripId) => {
	const entities = feedData?.entity
	if (!Array.isArray(entities)) return;

	return entities.some((e) => (
		e.vehicle?.trip?.trip_id === focusedTripId
		|| e.trip_update?.trip?.trip_id === focusedTripId
	))
}

const focusStore = (state, bus) => {
	const _fetchJson = async (url, options = {}) => {
		// todo: make configurable via `bus`?
		// const userAgent = `${pkg.name} at ${location.host}`
		const req = new Request(url, {
			mode: 'cors',
			redirect: 'follow',
			headers: {
				accept: 'application/json',
				// todo: this fails with CORS if the server doesn't allow it
				// 'user-agent': userAgent,
			},
			...options,
		})

		const res = await fetch(req)
		if (!res.ok) {
			const err = new Error(`${res.url}: ${res.status} ${res.statusText}`)
			err.req = req
			err.res = res
			throw err
		}

		return await res.json()
	}

	// todo: make these configurable via `bus`
	state.shapeIdsByTripIdUrl = '/shape-ids-by-trip-id.json'
	bus.on('shape-ids-by-trip-id-url:set', (newShapeIdsByTripIdUrl) => {
		if (state.shapeIdsByTripIdUrl === newShapeIdsByTripIdUrl) return;

		state.shapeIdsByTripIdUrl = newShapeIdsByTripIdUrl
		refetchShapeIdsByTripId()
		bus.emit(bus.STATE_CHANGE)
	})

	let fetchShapeIdsByTripIdController = new AbortController()
	const fetchShapeIdsByTripId = async () => {
		fetchShapeIdsByTripIdController = new AbortController()

		console.debug(`fetching shape IDs from ${state.shapeIdsByTripIdUrl}`)
		const shapeIds = await _fetchJson(state.shapeIdsByTripIdUrl, {
			signal: fetchShapeIdsByTripIdController.signal,
		})
		return shapeIds
	}

	let shapeIdsByTripId = {}
	const refetchShapeIdsByTripId = () => {
		fetchShapeIdsByTripIdController.abort()

		fetchShapeIdsByTripId()
		.then((shapeIds) => {
			shapeIdsByTripId = shapeIds
			refetchFocusedTripShape()
		})
		.catch((err) => {
			// todo: show this error in the UI
			console.error(`failed to fetch shape IDs`, err)
		})
	}

	state.shapeUrl = '/shapes/{shape_id}.geo.json'
	let shapeUrlTpl = parseUrlTemplate(state.shapeUrl)
	bus.on('shape-url:set', (newShapeUrl) => {
		if (state.shapeUrl === newShapeUrl) return;

		state.shapeUrl = newShapeUrl
		shapeUrlTpl = parseUrlTemplate(state.shapeUrl)
		refetchFocusedTripShape()
		bus.emit(bus.STATE_CHANGE)
	})

	state.focusedTripId = null
	state.focusedTripShape = null

	let feedContainsFocusedTripId = false
	const checkIfFeedStillContainsFocusedTripId = () => {
		if (state.focusedTripId === null) return;

		const nowContains = checkIfFeedContainsFocusedTripId(
			state.feedData,
			state.focusedTripId,
		)
		// feed contained trip_id before, not anymore
		if (feedContainsFocusedTripId && !nowContains) {
			state.focusedTripId = null
			state.focusedTripShape = null
			bus.emit(bus.STATE_CHANGE)
		}
	}
	bus.on('feed:data-change', checkIfFeedStillContainsFocusedTripId)

	let fetchShapeController = new AbortController()
	const fetchShape = async (shapeId, tripId) => {
		fetchShapeController = new AbortController()

		const url = shapeUrlTpl.expand({shape_id: shapeId})
		console.debug(`fetching shape ${shapeId} for trip ${tripId} from ${url}`)

		const t0 = Date.now()
		const shape = await _fetchJson(url, {
			signal: fetchShapeController.signal,
		})
		console.debug(`fetched shape ${shapeId} in ${Date.now() - t0}ms`)
		return shape
	}

	const refetchFocusedTripShape = () => {
		const tripId = state.focusedTripId
		if (tripId === null) return;

		fetchShapeController.abort()
		if (tripId !== null && hasProp(shapeIdsByTripId, tripId)) {
			const shapeId = shapeIdsByTripId[tripId]

			fetchShape(shapeId, tripId)
			.then((shape) => {
				state.focusedTripShape = shape
				bus.emit(bus.STATE_CHANGE)
			})
			.catch((err) => {
				// todo: show this error in the UI
				console.error(`failed to fetch shape ${shapeId} for trip ${tripId}`, err)
			})
		}
	}

	bus.on('focus-trip-id', (tripId) => {
		if (tripId === state.focusedTripId) return; // nothing changed, abort

		state.focusedTripId = tripId
		state.focusedTripShape = null
		// feed might not contain trip_id anymore
		checkIfFeedStillContainsFocusedTripId()

		refetchFocusedTripShape()

		bus.emit(bus.STATE_CHANGE)
	})
}

export default focusStore
