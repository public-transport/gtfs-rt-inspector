import {h} from 'preact'
import {homepage} from '../package.json'

const barView = ({state, emit}) => {
	const renderNavItem = (name, isActive) => {
		const handleClick = (ev) => {
			if (ev.metaKey || ev.ctrlKey) return;
			ev.preventDefault()
			emit('view:set', name)
		}
		// todo: add proper query string to the link
		return (
			<li class={isActive ? 'active': null}>
				<a href={'?view=' + name} onClick={handleClick}>{name}</a>
			</li>
		)
	}
	const nav = (
		<ul class="nav">
			{renderNavItem('log', state.view === 'log')}
			{renderNavItem('inspector', state.view === 'inspector')}
			{renderNavItem('map', state.view === 'map')}
			<li><a href={homepage} target="_parent" title={name + ' homepage'}>?</a></li>
		</ul>
	)

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
	const feed = (
		<div class="feed">
			<input onInput={handleFeedUrlInput} value={state.feedUrl} />
			<button onClick={handleSyncClick} disabled={!state.feedUrl || !!state.feedSyncing}>↺</button>
			<button onClick={handleStopStartClick} disabled={!state.feedUrl}>{state.feedSyncStopped ? '▶️' : '⏸'}</button>
		</div>
	)

	return (
		<div class="bar">
			<div class="logo">🚂🔍</div>
			{nav}
			{feed}
		</div>
	)
}

export default barView
