import {h} from 'preact'
import {renderDelay} from '../lib/render'

const renderTimestamp = (t) => {
	// todo: correct tz
	// todo: abbreviate?
	if (!t) {
		return '?';
	}
	return new Date(t * 1000).toISOString()
}

const renderFeedLogEntry = (entry) => {
	const {
		entityId, timestamp,
		routeId, directionId, tripId,
		vehicleId, vehicleLabel,
		stopId,
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
			<td>{renderTimestamp(tArrival)}</td>
			<td>{renderDelay(delay)}</td>
		</tr>
	)
}

const logView = ({state, emit}) => {
	const totalEntries = state.feedLog.length
	const feedLog = state.feedLog.slice(0, 1000)

	return (
		<div class="log">
			<p>Showing {feedLog.length}{totalEntries > feedLog.length ? ' out of ' + totalEntries : null} <code>StopTimeUpdate</code>s.</p>
			<table>
				<thead>
					<tr>
						<th rowspan="2"><code><abbr title="entity.id">e_id</abbr></code></th>
						<th rowspan="2"><abbr title="stop_time_update[].timestamp or feed timestamp"><code>t</code></abbr></th>
						<th colspan="2"><code>trip</code></th>
						<th colspan="3"><code>vehicle</code></th>
						<th colspan="3"><code>stop_time_update</code></th>
					</tr>
					<tr>
						<th><code>route_id</code></th>
						<th><code><abbr title="trip.direction_id">dir_id</abbr></code></th>
						<th><code>trip_id</code></th>
						<th><code>id</code></th>
						<th><code>label</code></th>
						<th><code>stop_id</code></th>
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
