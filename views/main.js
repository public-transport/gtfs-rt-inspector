import {h} from 'preact'

const mainView = (state, emit) => {
	const handleFeedUrlInput = (ev) => {
		emit('feed:set-url', ev.target.value)
	}
	const handleSyncClick = () => {
		emit('feed:sync')
	}
	const handleStopStartClick = () => {
		if (state.feedSyncStopped) emit('feed:start-sync')
		else emit('feed:stop-sync')
	}

	return (
		<div>
			<p>{state.feedUrl}</p>
			<input onInput={handleFeedUrlInput} value={state.feedUrl} />
			<button onClick={handleSyncClick} disabled={!!state.feedSyncing}>↺</button>
			<button onClick={handleStopStartClick}>{state.feedSyncStopped ? '▶️' : '⏸'}</button>
		</div>
	)
}

export default mainView
