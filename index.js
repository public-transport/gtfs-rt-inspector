import 'core-js/stable'
import 'regenerator-runtime/runtime'

import * as EventEmitter from 'events'
import {render, h} from 'preact'
import feedStore from './stores/feed'
import urlStore from './stores/url'
import Main from './views/main'

const state = {}
const bus = new EventEmitter()
bus.STATE_CHANGE = Symbol('state change')
bus.INITIAL_STATE = Symbol('initial state set up')
const emit = bus.emit.bind(bus)

feedStore(state, bus)
urlStore(state, bus)
setTimeout(emit, 0, bus.INITIAL_STATE)

const rerender = () => {
	render(<Main state={state} emit={emit} />, document.body)
}
bus.on(bus.STATE_CHANGE, rerender)
rerender()
