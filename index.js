import 'core-js/stable'
import 'regenerator-runtime/runtime'

import * as EventEmitter from 'events'
import {render} from 'preact'
import feedStore from './stores/feed'
import mainView from './views/main'

const state = {}
const bus = new EventEmitter()
const emit = bus.emit.bind(bus)

feedStore(state, bus)

const rerender = () => {
	render(mainView(state, emit), document.body)
}
bus.on('render', rerender)
rerender()
