export const feedLogStore = (state, bus) => {
	state.feedLog = []

	bus.on('feed:data-change', () => {
		if (!state.feedData) {
			state.feedLog = []
			return;
		}

		const now = Date.now() / 1000 | 0
		const header = state.feedData.header || {}
		const upcomingArrivals = (state.feedData.entity || [])
		// keep only FeedEntitys with a TripUpdate
		.filter(e => !!e.tripUpdate)
		// flatMap to one handy object for each StopTimeUpdate
		.flatMap(tu => (tu.tripUpdate.stopTimeUpdate || []).map(stu => ({
			entityId: tu.id,
			timestamp: tu.tripUpdate.timestamp || header.timestamp || null,
			routeId: tu.tripUpdate.trip.routeId,
			directionId: tu.tripUpdate.trip.directionId,
			tripId: tu.tripUpdate.trip.tripId,
			vehicleId: tu.tripUpdate.vehicle.id,
			vehicleLabel: tu.tripUpdate.vehicle.label,
			stopId: stu.stopId,
			tArrival: stu.arrival.time,
			delay: stu.arrival.delay,
		})))
		// keep all with a future/current arrival
		.filter(({tArrival}) => tArrival && tArrival >= now)
		// sooner arrival first, delayed first
		.sort((a, b) => {
			const timeUntilA = a.tArrival - now
			const timeUntilB = b.tArrival - now
			const aDelay = 'number' === typeof a.delay ? a.delay : 0
			const bDelay = 'number' === typeof b.delay ? b.delay : 0
			return timeUntilA / 30 === timeUntilB / 30
				? Math.abs(bDelay) - Math.abs(aDelay)
				: timeUntilA - timeUntilB
		})

		// todo: log trips
		// todo: log alerts
		// todo: track StopTimeUpdates across feedData updates
		state.feedLog = upcomingArrivals
	})
}
