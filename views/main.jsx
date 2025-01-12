import {h} from 'preact'
import Bar from './bar'
import Log from './log'
import Inspector from './inspector'
import Raw from './raw'
import _Map from './map'
import Error from './error'

const mainView = ({state, emit}) => {
	const View = ({
		'log': Log,
		'inspector': Inspector,
		'map': _Map,
		'raw': Raw
	})[state.view] || Inspector
	return (
		<div class="app">
			<Bar state={state} emit={emit} />
			<div class="view">
				{state.feedData ? (
					<View state={state} emit={emit} />
				) : (
					state.feedError ? (
						<Error state={state} emit={emit} />
					) : null
				)}
			</div>
		</div>
	)
}

export default mainView
