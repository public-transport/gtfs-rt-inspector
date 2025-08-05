import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import js from '@eslint/js';

export default defineConfig([
	globalIgnores(['dist/']),
	{

		files: ['**/*.jsx', '**/*.js'],
	},
	{
		languageOptions: {

			ecmaVersion: 2020,
			sourceType: 'module',

			globals: { 
				...globals.browser,
				...globals.node,
				__PROTOMAPS_TOKEN__: "readonly",
			},

			parserOptions: {
				ecmaFeatures: {
					modules: true,
					impliedStrict: true,
					jsx: true,
				},
			},
		},
	},
	{
		plugins: { js },
		extends: ['js/recommended']
	},
	{
		rules: {
			'no-unused-vars': 'off',
		},
	},
]);
