import { Bar } from './bar'
import { Log } from './log'
import { Inspector } from './inspector'
import { Map } from './map'

const views = {
	'log': Log,
	'inspector': Inspector,
	'map': Map,
}

export const Main = ({state, emit}) => {
	const View = views[state.view] || Inspector
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
