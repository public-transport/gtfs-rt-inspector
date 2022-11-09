import {h} from 'preact'
import {TripUpdate, VehiclePosition} from 'gtfs-rt-bindings'
import ms from 'ms'
import {renderDelay} from '../lib/render'

const renderStartDate = (sD) => {
	if ('string' !== typeof sD || !sD) return '?'
	return <code><abbr title={sD}>{sD.slice(4, 6)}-{sD.slice(6, 8)}</abbr></code>
}
const renderStartTime = (sT) => {
	if ('string' !== typeof sT || !sT) return '?'
	return <code>{sT}</code>
}

const {
	SCHEDULED,
	SKIPPED,
	NO_DATA,
} = TripUpdate.StopTimeUpdate.ScheduleRelationship
const renderScheduleRelationship = (sR) => {
	if (sR === SCHEDULED) return <code><abbr title="SCHEDULED">SCHED</abbr></code>
	if (sR === SKIPPED) return <code><abbr title="SKIPPED">SKIP</abbr></code>
	if (sR === NO_DATA) return <code><abbr title="NO_DATA">NO_DATA</abbr></code>
	return '?'
}

const {
	INCOMING_AT,
	STOPPED_AT,
	IN_TRANSIT_TO,
} = VehiclePosition.VehicleStopStatus
const renderVehicleStopStatus = (vSS) => {
	if (vSS === INCOMING_AT) return <code><abbr title="INCOMING_AT">INC_AT</abbr></code>
	if (vSS === STOPPED_AT) return <code><abbr title="STOPPED_AT">STOP_AT</abbr></code>
	if (vSS === IN_TRANSIT_TO) return <code><abbr title="IN_TRANSIT_TO">IN_TR_TO</abbr></code>
	return '?'
}

const renderPosition = (pos) => {
	if (!pos) return '?'
	const title = [
		'number' === typeof pos.latitude ? pos.latitude : '?',
		'number' === typeof pos.longitude ? pos.longitude : '?',
	].join(' | ')
	const lat = 'number' === typeof pos.latitude
		? <code>{pos.latitude.toFixed(3)}</code>
		: '?'
	const lon = 'number' === typeof pos.longitude
		? <code>{pos.longitude.toFixed(3)}</code>
		: '?'
	// todo: pos.bearing, pos.odometer, pos.speed
	// todo: don't wrap in a <div>
	return (<abbr title={title}>{lat} {lon}</abbr>)
}

const {
	RUNNING_SMOOTHLY,
	STOP_AND_GO,
	CONGESTION,
	SEVERE_CONGESTION,
} = VehiclePosition.CongestionLevel
const renderCongestionLevel = (gL) => {
	if (gL === 1) return <code><abbr title="RUNNING_SMOOTHLY">SMOOTH</abbr></code>
	if (gL === 2) return <code><abbr title="STOP_AND_GO">STOP_GO</abbr></code>
	if (gL === 3) return <code><abbr title="CONGESTION">CONG</abbr></code>
	if (gL === 4) return <code><abbr title="SEVERE_CONGESTION">SEV_CONG</abbr></code>
	return '?'
}

const {
	EMPTY,
	MANY_SEATS_AVAILABLE,
	FEW_SEATS_AVAILABLE,
	STANDING_ROOM_ONLY,
	CRUSHED_STANDING_ROOM_ONLY,
	FULL,
	NOT_ACCEPTING_PASSENGERS,
} = VehiclePosition.OccupancyStatus
const renderOccupancyStatus = (oS) => {
	if (oS === 0) return <code><abbr title="EMPTY">EMPTY</abbr></code>
	if (oS === 1) return <code><abbr title="MANY_SEATS_AVAILABLE">MANY_SEATS</abbr></code>
	if (oS === 2) return <code><abbr title="FEW_SEATS_AVAILABLE">FEW_SEATS</abbr></code>
	if (oS === 3) return <code><abbr title="STANDING_ROOM_ONLY">STANDING</abbr></code>
	if (oS === 4) return <code><abbr title="CRUSHED_STANDING_ROOM_ONLY">CRUSHED</abbr></code>
	if (oS === 5) return <code><abbr title="FULL">FULL</abbr></code>
	if (oS === 6) return <code><abbr title="NOT_ACCEPTING_PASSENGERS">NOT_ACCEPT</abbr></code>
	return '?'
}

const renderVehicleId = (vId, vehPos, emit) => {
	// todo: add missing `href`
	const onClick = (ev) => {
		emit('focus-vehicle-id', vId)
		emit('focus-trip-id', vehPos.trip.trip_id)
		emit('view:set', 'map')
		ev.preventDefault()
	}
	return (
		<a href="#" onClick={onClick} alt="show vehicle on the map">
			<code>{vId}</code>
		</a>
	)
}

const renderTripUpdate = (entity, emit) => {
	const t = entity.trip_update.trip || {}
	const v = entity.trip_update.vehicle || {}
	// todo: stop_time_update
	// todo: timestamp
	return (
		<tr id={'entity-' + entity.id}>
			<td><code>{entity.id}</code></td>
			<td><code>{t.route_id}</code></td>
			<td><code>{t.direction_id}</code></td>
			<td><code>{t.trip_id}</code></td>
			<td>{renderStartDate(t.start_date)}</td>
			<td>{renderStartTime(t.start_time)}</td>
			<td>{renderScheduleRelationship(t.schedule_relationship)}</td>
			<td><code>{v.id}</code></td>
			<td><code>{v.label}</code></td>
			<td><code>{v.license_plate}</code></td>
			<td>{renderDelay(entity.trip_update.delay)}</td>
		</tr>
	)
}
const renderTripUpdates = (feed, emit) => {
	const tripUpdates = feed.entity
	.filter(entity => !!entity.trip_update)

	return (
		<div>
			<h2><code>TripUpdate</code>s ({tripUpdates.length})</h2>
			<table class="trip-updates">
				<thead>
					<tr>
						<th rowspan="2"><code><abbr title="entity_id">e_id</abbr></code></th>
						<th colspan="5"><code>trip</code></th>
						<th rowspan="2"><code><abbr title="schedule_relationship">s_rel</abbr></code></th>
						<th colspan="3"><code>vehicle</code></th>
						<th rowspan="2"><code>delay</code></th>
					</tr>
					<tr>
						<th><code>route_id</code></th>
						<th><code><abbr title="direction_id">dir_id</abbr></code></th>
						<th><code>trip_id</code></th>
						<th><code><abbr title="start_date">st_date</abbr></code></th>
						<th><code><abbr title="start_time">st_time</abbr></code></th>
						<th><code>id</code></th>
						<th><code>label</code></th>
						<th><abbr title="license_plate"><code>lic_pl</code></abbr></th>
					</tr>
				</thead>
				<tbody>
					{tripUpdates.map(renderTripUpdate)}
				</tbody>
			</table>
		</div>
	)
}

const renderVehiclePosition = (entity, emit) => {
	const t = entity.vehicle.trip || {}
	const v = entity.vehicle.vehicle || {}
	// todo: stop_time_update
	// todo: timestamp
	return (
		<tr id={'entity-' + entity.id}>
			<td><code>{entity.id}</code></td>
			<td><code>{t.route_id}</code></td>
			<td><code>{t.direction_id}</code></td>
			<td><code>{t.trip_id}</code></td>
			<td>{renderStartDate(t.start_date)}</td>
			<td>{renderStartTime(t.start_time)}</td>
			<td>{renderVehicleId(v.id, entity.vehicle, emit)}</td>
			<td><code>{v.label}</code></td>
			<td><code>{v.license_plate}</code></td>
			<td><code>{entity.vehicle.current_stop_sequence}</code></td>
			<td><code>{entity.vehicle.stop_id}</code></td>
			<td>{renderVehicleStopStatus(entity.vehicle.current_status)}</td>
			<td>{renderPosition(entity.vehicle.position)}</td>
			<td>{renderCongestionLevel(entity.vehicle.congestion_level)}</td>
			<td>{renderOccupancyStatus(entity.vehicle.occupancy_status)}</td>
		</tr>
	)
}
const renderVehiclePositions = (feed, emit) => {
	const vehiclePositions = feed.entity
	.filter(entity => !!entity.vehicle)

	return (
		<div>
			<h2><code>VehiclePosition</code>s ({vehiclePositions.length})</h2>
			<table class="vehicle-positions">
				<thead>
					<tr>
						<th rowspan="2"><code><abbr title="entity_id">e_id</abbr></code></th>
						<th colspan="5"><code>trip</code></th>
						<th colspan="3"><code>vehicle</code></th>
						<th rowspan="2"><code><abbr title="current_stop_sequence">st_seq</abbr></code></th>
						<th rowspan="2"><code>stop_id</code></th>
						<th rowspan="2"><code><abbr title="current_status">status</abbr></code></th>
						<th rowspan="2"><code>position</code></th>
						<th rowspan="2"><code><abbr title="congestion_level">cong_lvl</abbr></code></th>
						<th rowspan="2"><code><abbr title="occupancy_status">occu</abbr></code></th>
					</tr>
					<tr>
						<th><code>route_id</code></th>
						<th><code><abbr title="direction_id">dir_id</abbr></code></th>
						<th><code>trip_id</code></th>
						<th><code><abbr title="start_date">st_date</abbr></code></th>
						<th><code><abbr title="start_time">st_time</abbr></code></th>
						<th><code>id</code></th>
						<th><code>label</code></th>
						<th><abbr title="license_plate"><code>lic_plate</code></abbr></th>
					</tr>
				</thead>
				<tbody>
					{vehiclePositions.map(vehPos => renderVehiclePosition(vehPos, emit))}
				</tbody>
			</table>
		</div>
	)
}

const inspectorView = ({state, emit}) => {
	const feed = state.feedData
	if (!Array.isArray(feed.entity) || feed.entity.length === 0) {
		return (
			<p>The feed has no <code>FeedEntity</code>s.</p>
		)
	}

	// todo: support alerts

	return (
		<div class="inspector">
			{renderTripUpdates(feed, emit)}
			{renderVehiclePositions(feed, emit)}
		</div>
	)
}

export default inspectorView
