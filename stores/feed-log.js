const feedLogStore = (state, bus) => {
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
		.filter(e => !!e.trip_update)
		// flatMap to one handy object for each StopTimeUpdate
		.flatMap(tu => (tu.trip_update.stop_time_update || []).map(stu => ({
			entityId: tu.id,
			timestamp: tu.trip_update.timestamp || header.timestamp || null,
			routeId: tu.trip_update.trip.route_id,
			directionId: tu.trip_update.trip.direction_id,
			tripId: tu.trip_update.trip.trip_id,
			vehicleId: tu.trip_update.vehicle.id,
			vehicleLabel: tu.trip_update.vehicle.label,
			stopId: stu.stop_id,
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
				? bDelay - aDelay
				: timeUntilA - timeUntilB
		})

		// todo: log trips
		// todo: log alerts
		// todo: track StopTimeUpdates across feedData updates
		state.feedLog = upcomingArrivals
	})
}

export default feedLogStore
