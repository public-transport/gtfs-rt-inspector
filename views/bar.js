import {h} from 'preact'
import pkg from '../package.json'

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
			<li><a href={pkg.homepage} target="_parent" title={name + ' homepage'}>?</a></li>
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
	const handleSyncIntervalChange = (ev) => {
		const val = parseInt(ev.target.value)
		emit('feed:set-sync-interval', val)
	}
	const feed = (
		<div class="feed">
			<input onInput={handleFeedUrlInput} value={state.feedUrl} />
			<input
				class="interval"
				type="number"
				min="1"
				step="10"
				onChange={handleSyncIntervalChange}
				value={state.feedSyncInterval}
			/>
			<button
				class={state.feedSyncing ? 'sync syncing' : 'sync'}
				onClick={handleSyncClick}
				disabled={!state.feedUrl || !!state.feedSyncing}
			>
				<span>↻</span>
			</button>
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
