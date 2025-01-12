import {h} from 'preact'
import ms from 'ms'

export const renderDelay = (delay) => {
	if ('number' !== typeof delay) return '?'
	return delay === 0 ? '0s' : ms(delay * 1000)
}

export const renderMaxItemsMsg = (nrOfItems, maxItems) => {
	if (nrOfItems < maxItems) {
		return null
	}
	return (
		<p>Only {maxItems} items are displayed. Use the filter search box above to get fewer items.</p>
	)
}

export const renderFilterInput = (filter, setFilter) => {
	return (
		<p>
			<input value={filter ?? ''} onChange={e => setFilter(e.target.value)} placeholder={'filter by text'} />
		</p>
	)
}
