import { pick } from 'lodash-es';

export const mapStateStore = (state, bus) => {
	state.mapZoom = 5
	state.mapLng = -74.5
	state.mapLat = 40

	bus.on('map-state:set', (partialState) => {
		Object.assign(state, pick(partialState, ['mapZoom', 'mapLng', 'mapLat']))
		bus.emit(bus.STATE_CHANGE)
	})
}
