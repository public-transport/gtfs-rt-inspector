import {h} from 'preact'

const MAX_BYTES = 1024 * 1024; // 1mb

// state.feedData -> JSON.stringify(state.feedData)
const feedAsJsonCache = new WeakMap()

const downloadBlob = (blob, fileName) => {
	// https://stackoverflow.com/a/33542499/1072129
	const a = window.document.createElement('a')
	// > Each time you call createObjectURL(), a new object URL is created, even if you've already created one for the same object. Each of these must be released by calling URL.revokeObjectURL() when you no longer need them.
	// > Browsers will release object URLs automatically when the document is unloaded; however, for optimal performance and memory usage, if there are safe times when you can explicitly unload them, you should do so.
	// https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL_static#memory_management
	a.href = URL.createObjectURL(blob)
	a.download = fileName
	document.body.appendChild(a)
	a.click()
	document.body.removeChild(a)
	// todo: does this work reliably?
	setTimeout(() => {
		URL.revokeObjectURL(a.href)
	}, 1000)
}

const rawView = ({state}) => {
	const feed = state.feedData
	const rawFeed = state.feedRawData
	let feedAsJson
	if (feedAsJsonCache.has(feed)) {
		feedAsJson = feedAsJsonCache.get(feed)
	} else {
		feedAsJson = JSON.stringify(feed, null, 2)
		feedAsJsonCache.set(feed, feedAsJson)
	}

	const feedUrlPathParts = new URL(state.feedUrl).pathname.split('/')
	const baseName = feedUrlPathParts[feedUrlPathParts.length - 1] || 'gtfs-rt'
	// todo: use feed's Last-Modified header!
	const fileName = `${baseName}-${new Date().toISOString()}.json`

	const downloadFeedAsJson = () => {
		const file = new Blob([feedAsJson], {
			type: 'application/json',
		})
		downloadBlob(file, fileName)
	}
	const downloadRawFeed = () => {
		const file = new Blob([rawFeed], {
			// https://stackoverflow.com/a/48051331/1072129
			type: 'application/vnd.google.protobuf',
		})
		downloadBlob(file, fileName)
	}

	return (
		<div class="raw">
			{feedAsJson.length > MAX_BYTES ? (
				<p>Truncated to {MAX_BYTES} of {feedAsJson.length} characters.</p>
			) : null}
			<p>
				<button onClick={downloadFeedAsJson}>download JSON-encoded feed</button>
				<button onClick={downloadRawFeed}>download raw Protocol-Buffers-encoded feed</button>
			</p>
			<pre>
				{feedAsJson.substring(0, MAX_BYTES)}
			</pre>
		</div>
	)
}

export default rawView
