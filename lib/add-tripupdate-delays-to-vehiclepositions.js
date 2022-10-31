import get from 'lodash/get.js'

const addTripUpdateDelaysToVehiclePositions = (feedData) => {
	for (const entity of feedData.entity) {
		// only work with reasonably explicit VehiclePositions
		const {trip, vehicle} = entity.vehicle || {}
		if (!trip || !trip.trip_id || !vehicle) continue

		const tripIdA = trip.trip_id
		const tripStartDateA = trip.start_date
		const tripStartTimeA = trip.start_time
		const vehicleIdA = vehicle.id

		for (const entity of feedData.entity) {
			// only work with reasonably explicit TripUpdates
			const {trip, vehicle, delay} = entity.trip_update || {}
			if (!trip || !trip.trip_id || !vehicle) continue

			const tripIdB = trip.trip_id
			const tripStartDateB = trip.start_date
			const tripStartTimeB = trip.start_time
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

export {
	addTripUpdateDelaysToVehiclePositions,
}
