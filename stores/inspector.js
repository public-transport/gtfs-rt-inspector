export const MAX_TRIP_UPDATES = 1000;
export const MAX_VEHICLE_POSITIONS = 1000;

const inspectorStore = (state, bus) => {
	state.inspectorFilter = null
	state.unfilteredTripUpdates = []
	state.tripUpdates = []
	state.unfilteredVehiclePositions = []
	state.vehiclePositions = []

	const recomputeFilteredFeedData = () => {
		if (!state.feedData) {
			state.unfilteredTripUpdates = []
			state.tripUpdates = []
			return;
		}

		const feedEntities = state.feedData?.entity ?? []
		const query = state.inspectorFilter ?? ''

		const tripUpdates = feedEntities
		.filter(entity => !!entity.trip_update)
		const filteredTripUpdates = query
			? tripUpdates
			.filter(tU => JSON.stringify(tU).toLowerCase().includes(query))
			: tripUpdates
		const truncatedFilteredTripUpdates = filteredTripUpdates
		// todo: allow pagination?
		.slice(0, MAX_TRIP_UPDATES)

		const vehiclePositions = feedEntities
		.filter(entity => !!entity.vehicle)
		const filteredVehiclePositions = query
			? vehiclePositions
			.filter(vP => JSON.stringify(vP).toLowerCase().includes(query))
			: vehiclePositions
		const truncatedFilteredVehiclePositions = filteredVehiclePositions
		// todo: allow pagination?
		.slice(0, MAX_VEHICLE_POSITIONS)

		state.unfilteredTripUpdates = tripUpdates
		state.tripUpdates = truncatedFilteredTripUpdates
		state.unfilteredVehiclePositions = vehiclePositions
		state.vehiclePositions = truncatedFilteredVehiclePositions
		bus.emit(bus.STATE_CHANGE)
	}

	bus.on('inspector:set-filter', (filter) => {
		if (state.inspectorFilter === filter) {
			return; // no changes necessary
		}
		state.inspectorFilter = filter

		recomputeFilteredFeedData()
	}),

	bus.on('feed:data-change', recomputeFilteredFeedData)
}

export default inspectorStore
