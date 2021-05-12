import ms from 'ms'

export function humanDelay (delay) {
	if ('number' !== typeof delay) return '?'
	return delay === 0 ? '0m' : ms(delay * 1000)
}
