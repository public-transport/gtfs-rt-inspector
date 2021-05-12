import { transit_realtime as rt } from 'gtfs-realtime-bindings'
import {humanDelay} from '../lib/time'

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
} = rt.TripUpdate.StopTimeUpdate.ScheduleRelationship
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
} = rt.VehiclePosition.VehicleStopStatus
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
} = rt.VehiclePosition.CongestionLevel
const renderCongestionLevel = (gL) => {
	if (gL === RUNNING_SMOOTHLY) return <code><abbr title="RUNNING_SMOOTHLY">SMOOTH</abbr></code>
	if (gL === STOP_AND_GO) return <code><abbr title="STOP_AND_GO">STOP_GO</abbr></code>
	if (gL === CONGESTION) return <code><abbr title="CONGESTION">CONG</abbr></code>
	if (gL === SEVERE_CONGESTION) return <code><abbr title="SEVERE_CONGESTION">SEV_CONG</abbr></code>
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
} = rt.VehiclePosition.OccupancyStatus
const renderOccupancyStatus = (oS) => {
	if (oS === EMPTY) return <code><abbr title="EMPTY">EMPTY</abbr></code>
	if (oS === MANY_SEATS_AVAILABLE) return <code><abbr title="MANY_SEATS_AVAILABLE">MANY_SEATS</abbr></code>
	if (oS === FEW_SEATS_AVAILABLE) return <code><abbr title="FEW_SEATS_AVAILABLE">FEW_SEATS</abbr></code>
	if (oS === STANDING_ROOM_ONLY) return <code><abbr title="STANDING_ROOM_ONLY">STANDING</abbr></code>
	if (oS === CRUSHED_STANDING_ROOM_ONLY) return <code><abbr title="CRUSHED_STANDING_ROOM_ONLY">CRUSHED</abbr></code>
	if (oS === FULL) return <code><abbr title="FULL">FULL</abbr></code>
	if (oS === NOT_ACCEPTING_PASSENGERS) return <code><abbr title="NOT_ACCEPTING_PASSENGERS">NOT_ACCEPT</abbr></code>
	return '?'
}

const renderTripUpdate = (entity) => {
	const t = entity.tripUpdate.trip || {}
	const v = entity.tripUpdate.vehicle || {}
	// todo: stop_time_update
	// todo: timestamp
	return (
		<tr id={'entity-' + entity.id}>
			<td><code>{entity.id}</code></td>
			<td><code>{t.routeId}</code></td>
			<td><code>{t.directionId}</code></td>
			<td><code>{t.tripId}</code></td>
			<td>{renderStartDate(t.startDate)}</td>
			<td>{renderStartTime(t.startTime)}</td>
			<td>{renderScheduleRelationship(t.scheduleRelationship)}</td>
			<td><code>{v.id}</code></td>
			<td><code>{v.label}</code></td>
			<td><code>{v.licensePlate}</code></td>
			<td>{humanDelay(entity.tripUpdate.delay)}</td>
		</tr>
	)
}
const TripUpdates = ({feed}) => {
	const tripUpdates = feed.entity
	.filter(entity => !!entity.tripUpdate)

	return (
		<div>
			<h2><code>TripUpdate</code>s</h2>
			<table class="trip-updates">
				<thead>
					<tr>
						<th rowspan="2"><code><abbr title="entityId">e_id</abbr></code></th>
						<th colspan="5"><code>trip</code></th>
						<th rowspan="2"><code><abbr title="scheduleRelationship">s_rel</abbr></code></th>
						<th colspan="3"><code>vehicle</code></th>
						<th rowspan="2"><code>delay</code></th>
					</tr>
					<tr>
						<th><code>routeId</code></th>
						<th><code><abbr title="directionId">dir_id</abbr></code></th>
						<th><code>tripId</code></th>
						<th><code><abbr title="startDate">st_date</abbr></code></th>
						<th><code><abbr title="startTime">st_time</abbr></code></th>
						<th><code>id</code></th>
						<th><code>label</code></th>
						<th><abbr title="licensePlate"><code>lic_pl</code></abbr></th>
					</tr>
				</thead>
				<tbody>
					{tripUpdates.map(renderTripUpdate)}
				</tbody>
			</table>
		</div>
	)
}

const renderVehiclePosition = (entity) => {
	const t = entity.vehicle.trip || {}
	const v = entity.vehicle.vehicle || {}
	// todo: stop_time_update
	// todo: timestamp
	return (
		<tr id={'entity-' + entity.id}>
			<td><code>{entity.id}</code></td>
			<td><code>{t.routeId}</code></td>
			<td><code>{t.directionId}</code></td>
			<td><code>{t.tripId}</code></td>
			<td>{renderStartDate(t.startDate)}</td>
			<td>{renderStartTime(t.startTime)}</td>
			<td><code>{v.id}</code></td>
			<td><code>{v.label}</code></td>
			<td><code>{v.licensePlate}</code></td>
			<td><code>{entity.vehicle.currentStopSequence}</code></td>
			<td><code>{entity.vehicle.stopId}</code></td>
			<td>{renderVehicleStopStatus(entity.vehicle.currentStatus)}</td>
			<td>{renderPosition(entity.vehicle.position)}</td>
			<td>{renderCongestionLevel(entity.vehicle.congestionLevel)}</td>
			<td>{renderOccupancyStatus(entity.vehicle.occupancyStatus)}</td>
		</tr>
	)
}
const VehiclePositions = ({feed}) => {
	const vehiclePositions = feed.entity
	.filter(entity => !!entity.vehicle)

	return (
		<div>
			<h2><code>VehiclePosition</code>s</h2>
			<table class="vehicle-positions">
				<thead>
					<tr>
						<th rowspan="2"><code><abbr title="entity_id">e_id</abbr></code></th>
						<th colspan="5"><code>trip</code></th>
						<th colspan="3"><code>vehicle</code></th>
						<th rowspan="2"><code><abbr title="currentStopSequence">st_seq</abbr></code></th>
						<th rowspan="2"><code>stopId</code></th>
						<th rowspan="2"><code><abbr title="currentStatus">status</abbr></code></th>
						<th rowspan="2"><code>position</code></th>
						<th rowspan="2"><code><abbr title="congestionLevel">cong_lvl</abbr></code></th>
						<th rowspan="2"><code><abbr title="occupancyStatus">occu</abbr></code></th>
					</tr>
					<tr>
						<th><code>routeId</code></th>
						<th><code><abbr title="directionId">dir_id</abbr></code></th>
						<th><code>tripId</code></th>
						<th><code><abbr title="startDate">st_date</abbr></code></th>
						<th><code><abbr title="startTime">st_time</abbr></code></th>
						<th><code>id</code></th>
						<th><code>label</code></th>
						<th><abbr title="licensePlate"><code>lic_plate</code></abbr></th>
					</tr>
				</thead>
				<tbody>
					{vehiclePositions.map(renderVehiclePosition)}
				</tbody>
			</table>
		</div>
	)
}

export const Inspector = ({state}) => {
	const feed = state.feedData
	if (!Array.isArray(feed.entity) || feed.entity.length === 0) {
		return (
			<p>The feed has no <code>FeedEntity</code>s.</p>
		)
	}

	// todo: support alerts

	return (
		<div class="inspector">
			<TripUpdates feed={feed}/>
			<VehiclePositions feed={feed}/>
		</div>
	)
}
