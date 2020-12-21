import {h} from 'preact'
import Bar from './bar'
import Inspector from './inspector'

const mainView = ({state, emit}) => {
	return (
		<div class="app">
			<Bar state={state} emit={emit} />
			{state.feedData ? (
				<Inspector state={state} emit={emit} />
			): null}
		</div>
	)
}

export default mainView
