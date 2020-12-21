import {h} from 'preact'
import ms from 'ms'

const renderDelay = (delay) => {
	if ('number' !== typeof delay) return '?'
	return delay === 0 ? '0s' : ms(delay * 1000)
}
const renderScheduleRelationship = (sR) => {
	if (sR === 0) return <code><abbr title="SCHEDULED">SCHED</abbr></code>
	if (sR === 1) return <code><abbr title="SKIPPED">SKIP</abbr></code>
	if (sR === 2) return <code><abbr title="NO_DATA">NO_DATA</abbr></code>
	return '?'
}
const renderTripUpdate = (entity) => {
	const t = entity.trip_update.trip
	const v = entity.trip_update.vehicle
	// todo: stop_time_update
	// todo: timestamp
	return (
		<tr>
			<td><code>{entity.id}</code></td>
			<td><code>{t.route_id}</code></td>
			<td><code>{t.direction_id}</code></td>
			<td><code>{t.trip_id}</code></td>
			<td><code><abbr title={t.start_date}>{t.start_date.slice(4, 6)}-{t.start_date.slice(6, 8)}</abbr></code></td>
			<td><code>{t.start_time}</code></td>
			<td>{renderScheduleRelationship(t.schedule_relationship)}</td>
			<td><code>{v.id}</code></td>
			<td><code>{v.label}</code></td>
			<td><code>{v.license_plate}</code></td>
			<td>{renderDelay(entity.trip_update.delay)}</td>
		</tr>
	)
}
const renderTripUpdates = (feed) => {
	const tripUpdates = feed.entity
	.filter(entity => !!entity.trip_update)

	return (
		<div>
			<h2><code>TripUpdate</code>s</h2>
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
						<th><code>license_plate</code></th>
					</tr>
				</thead>
				<tbody>
					{tripUpdates.map(renderTripUpdate)}
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

	return (
		<div class="inspector">
			{renderTripUpdates(feed)}
			// todo: vehicle positions
		</div>
	)
}

export default inspectorView
