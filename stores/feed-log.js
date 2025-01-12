export const MAX_LOG_ITEMS = 1000;

const feedLogStore = (state, bus) => {
	state.feedLogFilter = null
	state.unfilteredFeedLog = []
	state.feedLog = []

	const recomputeFeedLog = () => {
		if (!state.feedData) {
			state.unfilteredFeedLog = []
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
			routeId: tu.trip_update.trip?.route_id,
			directionId: tu.trip_update.trip?.direction_id,
			tripId: tu.trip_update.trip?.trip_id,
			vehicleId: tu.trip_update.vehicle?.id,
			vehicleLabel: tu.trip_update.vehicle?.label,
			stopId: stu.stop_id,
			tArrival: stu.arrival?.time ?? null,
			delay: stu.arrival?.delay ?? stu.departure?.delay,
		})))
		// keep all
		// - with a future/current arrival or departure
		// - without an (absolute) arrival time but with (relative) delay
		.filter(({tArrival, delay}) => {
			return tArrival !== null ? tArrival >= now : delay !== null
		})
		// sooner arrival first (those without arrival last), delayed first
		.sort((a, b) => {
			const timeUntilA = 'number' === typeof a.tArrival ? a.tArrival - now : Number.MAX_SAFE_INTEGER
			const timeUntilB = 'number' === typeof b.tArrival ? b.tArrival - now : Number.MAX_SAFE_INTEGER
			const aDelay = 'number' === typeof a.delay ? a.delay : 0
			const bDelay = 'number' === typeof b.delay ? b.delay : 0
			return timeUntilA / 30 === timeUntilB / 30
				? Math.abs(bDelay) - Math.abs(aDelay)
				: timeUntilA - timeUntilB
		})

		const query = state.feedLogFilter ?? ''
		const filteredUpcomingArrivals = query
			? upcomingArrivals
			.filter(e => JSON.stringify(e).toLowerCase().includes(query))
			: upcomingArrivals

		const truncatedFilteredUpcomingArrivals = filteredUpcomingArrivals
		// todo: allow pagination?
		.slice(0, MAX_LOG_ITEMS)

		// todo: log trips
		// todo: log alerts
		// todo: track StopTimeUpdates across feedData updates
		state.unfilteredFeedLog = upcomingArrivals
		state.feedLog = truncatedFilteredUpcomingArrivals
		bus.emit(bus.STATE_CHANGE)
	}

	bus.on('feed-log:set-filter', (filter) => {
		if (state.feedLogFilter === filter) {
			return; // no changes necessary
		}
		state.feedLogFilter = filter

		recomputeFeedLog()
	}),

	bus.on('feed:data-change', recomputeFeedLog)
}

export default feedLogStore
