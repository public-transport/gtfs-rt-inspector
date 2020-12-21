import {h} from 'preact'

const inspectorView = ({state, emit}) => {
	const feed = state.feedData
	if (!Array.isArray(feed.entity) || feed.entity.length === 0) {
		return (
			<p>The feed has no <code>FeedEntity</code>s.</p>
		)
	}

	return (
		<div class="inspector">
			// todo: trip updates
			// todo: vehicle positions
		</div>
	)
}

export default inspectorView
