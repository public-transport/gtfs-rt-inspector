import {h} from 'preact'
import {MAX_LOG_ITEMS} from '../stores/feed-log'
import {
	renderDelay,
	renderFilterInput,
	renderMaxItemsMsg,
} from '../lib/render'
import {TripUpdate} from 'gtfs-rt-bindings'

const renderTimestamp = (t) => {
	// todo: correct tz
	// todo: abbreviate?
	if (!t) {
		return '?';
	}
	return new Date(t * 1000).toISOString()
}

const {
	SCHEDULED,
	SKIPPED,
	NO_DATA,
} = TripUpdate.StopTimeUpdate.ScheduleRelationship
const renderStopTimeUpdateScheduleRelationship = (sR) => {
	if (sR === SCHEDULED) return <code><abbr title="SCHEDULED">SCHED</abbr></code>
	if (sR === SKIPPED) return <code><abbr title="SKIPPED">SKIP</abbr></code>
	if (sR === NO_DATA) return <code><abbr title="NO_DATA">NO_DATA</abbr></code>
	return '?'
}

const renderFeedLogEntry = (entry) => {
	const {
		entityId, timestamp,
		routeId, directionId, tripId,
		vehicleId, vehicleLabel,
		stopId,
		scheduleRelationship,
		tArrival, delay,
	} = entry
	return (
		<tr id={'entity-' + entityId}>
			<td><code>{entityId}</code></td>
			<td>{renderTimestamp(timestamp)}</td>
			<td><code>{routeId}</code></td>
			<td><code>{directionId}</code></td>
			<td><code>{tripId}</code></td>
			<td><code>{vehicleId}</code></td>
			<td><code>{vehicleLabel}</code></td>
			<td><code>{stopId}</code></td>
			<td>{renderStopTimeUpdateScheduleRelationship(scheduleRelationship)}</td>
			<td>{renderTimestamp(tArrival)}</td>
			<td>{renderDelay(delay)}</td>
		</tr>
	)
}

const logView = ({state, emit}) => {
	const {
		feedLogFilter,
		feedLog,
		unfilteredFeedLog,
	} = state
	const setFilter = (filter) => {
		emit('feed-log:set-filter', filter)
	}

	return (
		<div class="log">
			<h2>Upcoming <code>StopTimeUpdate</code>s ({feedLog.length} of {unfilteredFeedLog.length})</h2>
			{renderFilterInput(feedLogFilter, setFilter)}
			{renderMaxItemsMsg(feedLog.length, MAX_LOG_ITEMS)}
			<table>
				<thead>
					<tr>
						<th rowspan="2"><code><abbr title="entity.id">e_id</abbr></code></th>
						<th rowspan="2"><abbr title="stop_time_update[].timestamp or feed timestamp"><code>t</code></abbr></th>
						<th colspan="2"><code>trip</code></th>
						<th colspan="3"><code>vehicle</code></th>
						<th colspan="4"><code>stop_time_update</code></th>
					</tr>
					<tr>
						<th><code>route_id</code></th>
						<th><code><abbr title="trip.direction_id">dir_id</abbr></code></th>
						<th><code>trip_id</code></th>
						<th><code>id</code></th>
						<th><code>label</code></th>
						<th><code>stop_id</code></th>
						<th><abbr title="stop_time_update[].schedule_relationship">s_rel</abbr></th>
						<th><code><abbr title="stop_time_update[].arrival.time">arr</abbr></code></th>
						<th><code><abbr title="stop_time_update[].arrival.delay">delay</abbr></code></th>
					</tr>
				</thead>
				<tbody>
					{feedLog.map(renderFeedLogEntry)}
				</tbody>
			</table>
		</div>
	)
}

export default logView
