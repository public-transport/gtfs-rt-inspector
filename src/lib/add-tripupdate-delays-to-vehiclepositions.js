export const addTripUpdateDelaysToVehiclePositions = (feedData) => {
	for (const entity of feedData.entity) {
		// only work with reasonably explicit VehiclePositions
		const {trip, vehicle} = entity.vehicle || {}
		if (!trip || !trip.tripId || !vehicle) continue

		const tripIdA = trip.tripId
		const tripStartDateA = trip.startDate
		const tripStartTimeA = trip.startTime
		const vehicleIdA = vehicle.id

		for (const entity of feedData.entity) {
			// only work with reasonably explicit TripUpdates
			const {trip, vehicle, delay} = entity.tripUpdate || {}
			if (!trip || !trip.tripId || !vehicle) continue

			const tripIdB = trip.tripId
			const tripStartDateB = trip.startDate
			const tripStartTimeB = trip.startTime
			const vehicleIdB = vehicle.id

			if (tripIdA !== tripIdB) continue
			const compareVehicleIds = !!(vehicleIdA && vehicleIdB)
			if (compareVehicleIds && vehicleIdA !== vehicleIdB) continue
			const compareTripStartDates = !!(tripStartDateA && tripStartDateB)
			if (compareTripStartDates && tripStartDateA !== tripStartDateB) continue
			const compareTripStartTimes = !!(tripStartTimeA && tripStartTimeB)
			if (compareTripStartTimes && tripStartTimeA !== tripStartTimeB) continue

			console.error('\nA', {tripIdA, tripStartDateA, tripStartTimeA, vehicleIdA})
			console.error('B', {tripIdB, tripStartDateB, tripStartTimeB, vehicleIdB})

			if (
				!compareVehicleIds &&
				(!compareTripStartDates || !compareTripStartTimes)
			) continue

			if ('number' === typeof delay) {
				console.error('match')
				// make un-enumerable to keep list of enumerable fields spec-compliant
				Object.defineProperty(entity, 'delay', {value: delay})
				break
			}
			// todo: otherwise use entitiy.trip_update.stop_time_update to find delay
		}
	}
}
