import { defineConfig, loadEnv } from 'vite'
import preact from "@preact/preset-vite";

export default defineConfig(({ command, mode }) => {
	const env = loadEnv(mode, process.cwd(), '')

	if (!env.PROTOMAPS_TOKEN) {
		throw new Error('missing/empty $PROTOMAPS_TOKEN')
	}

	return {
		// vite config
		define: {
			__PROTOMAPS_TOKEN__: JSON.stringify(env.PROTOMAPS_TOKEN),
		},
		plugins: [preact()],
		base: './',
	}
})
