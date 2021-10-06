import {h} from 'preact'
import inspect from 'object-inspect'

const errorView = ({state, emit}) => {
	const err = state.feedError
	const stack = ('\t' + err.stack.replace(/\n/g, '\t\n')).trim()

	return (
		<div class="error">
			<h2><code>failed to fetch the feed</code></h2>
			<pre><code>{inspect(err) + '\n' + stack}</code></pre>
		</div>
	)
}

export default errorView
