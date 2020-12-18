import {h} from 'preact'

const mainView = (state, emit) => {
	const handleClick = () => {
		emit('clicks:add', 1)
	}

	return (
		<body>
			<p>Number of clicks stored: {state.totalClicks}</p>
			<button onClick={handleClick}>Emit a click event</button>
		</body>
	)
}

export default mainView
