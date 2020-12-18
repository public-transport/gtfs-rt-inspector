const clicksStore = (state, bus) => {
	state.totalClicks = 0

	bus.on('clicks:add', (count) => {
		state.totalClicks += count
		bus.emit('render')
	})
}

export default clicksStore
