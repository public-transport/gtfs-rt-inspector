import {h} from 'preact'

const barView = ({state, emit}) => {
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
		<div class="bar">
			<span class="logo">🚂🔍</span>
			<input onInput={handleFeedUrlInput} value={state.feedUrl} />
			<button onClick={handleSyncClick} disabled={!state.feedUrl || !!state.feedSyncing}>↺</button>
			<button onClick={handleStopStartClick} disabled={!state.feedUrl}>{state.feedSyncStopped ? '▶️' : '⏸'}</button>
		</div>
	)
}

export default barView
