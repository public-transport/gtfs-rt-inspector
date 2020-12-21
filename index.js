import 'core-js/stable'
import 'regenerator-runtime/runtime'

import * as EventEmitter from 'events'
import {render, h} from 'preact'
import feedStore from './stores/feed'
import Main from './views/main'

const state = {}
const bus = new EventEmitter()
const emit = bus.emit.bind(bus)

feedStore(state, bus)

const rerender = () => {
	render(<Main state={state} emit={emit} />, document.body)
}
bus.on('render', rerender)
rerender()
