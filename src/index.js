// uncomment for devtools
// import 'preact/debug'

import EventEmitter from 'mitt'
import { render } from 'preact'
import { useCallback, useEffect, useState } from 'preact/hooks';

import { viewStore } from './stores/view'
import { feedStore } from './stores/feed'
import { feedLogStore } from './stores/feed-log'
import { urlStore } from './stores/url'
import { mapStateStore } from './stores/map-state';
import { Main } from './views/main'

import './style.css'

export const STATE_CHANGE = Symbol('state change');

const state = {}
const bus = new EventEmitter()
bus.STATE_CHANGE = STATE_CHANGE
const emit = bus.emit.bind(bus)

viewStore(state, bus)
feedStore(state, bus)
feedLogStore(state, bus)
mapStateStore(state, bus)
urlStore(state, bus)

window.state = state

function useRerender() {
	const [, setState] = useState(false)
	return useCallback(() => {
		setState(s => !s)
	}, [setState])
}

function App() {
	const rerender = useRerender()

	useEffect(() => {
		bus.on(STATE_CHANGE, rerender)
		return bus.off.bind(bus, STATE_CHANGE, rerender)
	}, []);

	return (
		<Main state={state} emit={emit} />
	)
}

render(<App />, document.body);
