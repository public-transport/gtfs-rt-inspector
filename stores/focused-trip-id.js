import AbortController from 'abort-controller'
import createFetch from 'fetch-ponyfill'
const {Request, fetch} = createFetch()
import pkg from '../package.json' assert {type: 'json'}

const hasProp = (o, k) => Object.prototype.hasOwnProperty.call(o, k)

const focusedTripIdStore = (state, bus) => {
	// todo: make these configurable via `bus`
	const SHAPES_BASE_URL = 'http://localhost:3001/trimet-2022-10-25/shapes/'
	const SHAPES_USER_AGENT = `${pkg.name} at ${location.host}`

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

	// todo: fetch() this data on-the-fly from somewhere
	const shapeIdsByTripId = {}

	state.focusedTripId = null
	state.focusedTripShape = null

	let fetchShapeController = new AbortController()
	const fetchShape = async (shapeId, tripId) => {
		fetchShapeController = new AbortController()

		const url = `${SHAPES_BASE_URL}${shapeId}.geo.json`
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

		refetchFocusedTripShape()

		bus.emit(bus.STATE_CHANGE)
	})
}

export default focusedTripIdStore
