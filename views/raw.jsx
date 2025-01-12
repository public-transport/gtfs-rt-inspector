import {h} from 'preact'

const MAX_BYTES = 1024 * 1024; // 1mb

// state.feedData -> JSON.stringify(state.feedData)
const feedAsJsonCache = new WeakMap()

const rawView = ({state}) => {
	const feed = state.feedData
	let feedAsJson
	if (feedAsJsonCache.has(feed)) {
		feedAsJson = feedAsJsonCache.get(feed)
	} else {
		feedAsJson = JSON.stringify(feed, null, 2)
		feedAsJsonCache.set(feed, feedAsJson)
	}

	return (
		<div class="raw">
			{feedAsJson.length > MAX_BYTES ? (
				<p>Truncated to {MAX_BYTES} of {feedAsJson.length} characters.</p>
			) : null}
			<pre>
				{feedAsJson.substring(0, MAX_BYTES)}
			</pre>
		</div>
	)
}

export default rawView
