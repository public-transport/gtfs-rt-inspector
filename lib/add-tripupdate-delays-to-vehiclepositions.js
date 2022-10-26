const get = require('lodash/get')

const addTripUpdateDelaysToVehiclePositions = (feedData) => {
	for (const entityA of feedData.entity) {
		// only work with reasonably explicit VehiclePositions
		const {trip, vehicle} = entityA.vehicle || {}
		if (!trip || !trip.trip_id || !vehicle) continue

		const tripIdA = trip.trip_id
		const tripStartDateA = trip.start_date
		const tripStartTimeA = trip.start_time
		const vehicleIdA = vehicle.id

		for (const entityB of feedData.entity) {
			// only work with reasonably explicit TripUpdates
			const {trip, vehicle, delay} = entityB.trip_update || {}
			if (!trip || !trip.trip_id || !vehicle) continue

			// a TripUpdate without a delay is useless for us
			// todo: otherwise use entitiy.trip_update.stop_time_update to find delay
			if ('number' !== typeof delay) continue

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

			if (
				!compareVehicleIds &&
				(!compareTripStartDates || !compareTripStartTimes)
			) continue

			console.error('A', {tripIdA, tripStartDateA, tripStartTimeA, vehicleIdA})
			console.error('B', {tripIdB, tripStartDateB, tripStartTimeB, vehicleIdB})

			// make un-enumerable to keep list of enumerable fields spec-compliant
			Object.defineProperty(entityA, 'delay', {value: delay})
			break
		}
	}
}

module.exports = addTripUpdateDelaysToVehiclePositions
