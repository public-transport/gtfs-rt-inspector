import {h} from 'preact'
// import {TripUpdate, VehiclePosition} from 'gtfs-rt-bindings'
import ms from 'ms'

export const renderDelay = (delay) => {
	if ('number' !== typeof delay) return '?'
	return delay === 0 ? '0s' : ms(delay * 1000)
}
