'use strict'

const webpack = require('webpack')
const HtmlPlugin = require('html-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')
const path = require('path')
const pkg = require('./package.json')

module.exports = {
	entry: './index.js',
	output: {
		filename: 'main.js',
	},
	plugins: [
		new HtmlPlugin({
			title: pkg.title,
			template: 'index.html',
			favicon: 'assets/icon.png',
		}),
		new CopyPlugin({
			patterns: [
				{from: 'assets'},
				require.resolve('mapbox-gl/dist/mapbox-gl.css'),
			],
		}),
		new webpack.EnvironmentPlugin([
			'MAPBOX_TOKEN',
		]),
	],
	module: {
		rules: [{
			test: /\.jsx?$/,
			exclude: [
				// https://github.com/mapbox/mapbox-gl-js/issues/3422
				/\bmapbox-gl\b/,
			],
			loader: 'babel-loader',
			options: {
				presets: [
					['@babel/preset-env', {
						useBuiltIns: 'entry',
						corejs: 3,
					}],
				],
				plugins: [
					['@babel/plugin-transform-react-jsx', {
						pragma: 'h',
						pragmaFrag: 'Fragment',
						// runtime: 'automatic',
						// importSource: 'preact/h',
						useSpread: true,
					}],
				],
			},
		}]
	},
	devServer: {
		port: 8000, // todo: remove
		contentBase: path.join(__dirname, 'dist'),
	},
}
