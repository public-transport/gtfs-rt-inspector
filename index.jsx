import 'core-js/stable'
import 'regenerator-runtime/runtime'

import EventEmitter from 'events'
import {render, h} from 'preact'
import viewStore from './stores/view'
import feedStore from './stores/feed'
import feedLogStore from './stores/feed-log'
import focusStore from './stores/focus'
import urlStore from './stores/url'
import Main from './views/main'

const state = {}
const bus = new EventEmitter()
bus.STATE_CHANGE = Symbol('state change')
const emit = bus.emit.bind(bus)

viewStore(state, bus)
feedStore(state, bus)
feedLogStore(state, bus)
focusStore(state, bus)
urlStore(state, bus)

const rerender = () => {
	render(<Main state={state} emit={emit} />, document.body)
}
bus.on(bus.STATE_CHANGE, rerender)
rerender()
