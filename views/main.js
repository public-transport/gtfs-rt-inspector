import {h} from 'preact'

const mainView = (state, emit) => {
	const handleFeedUrlInput = (ev) => {
		emit('feed:set-url', ev.target.value)
	}
	const handleSyncClick = () => {
		emit('feed:sync')
	}

	return (
		<div>
			<p>{state.feedUrl}</p>
			<input onInput={handleFeedUrlInput} value={state.feedUrl} />
			<button onClick={handleSyncClick} disabled={!!state.feedSyncing}>↺</button>
		</div>
	)
}

export default mainView
