import {h} from 'preact'
import Bar from './bar'
import Inspector from './inspector'
import _Map from './map'

const mainView = ({state, emit}) => {
	const View = ({
		'inspector': Inspector,
		'map': _Map,
	})[state.view] || Inspector
	return (
		<div class="app">
			<Bar state={state} emit={emit} />
			<div class="view">
				{state.feedData ? (
					<View state={state} emit={emit} />
				): null}
			</div>
		</div>
	)
}

export default mainView
