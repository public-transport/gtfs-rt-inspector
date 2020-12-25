const viewStore = (state, bus) => {
	state.view = 'inspector'

	bus.on('view:set', (view) => {
		if (view === state.view) return; // nothing changed, abort
		state.view = view
		bus.emit(bus.STATE_CHANGE)
	})
}

export default viewStore
