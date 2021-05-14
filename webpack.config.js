'use strict'

const path = require('path')

const HtmlPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

const pkg = require('./package.json')

module.exports = {
	entry: './src/index.js',
	output: {
		filename: 'main.js',
	},
	plugins: [
		new HtmlPlugin({
			title: pkg.title,
			template: 'src/index.html',
			favicon: 'assets/icon.png',
		}),
		new MiniCssExtractPlugin(),
	],
	module: {
		rules: [
			{
				test: /\.jsx?$/,
				exclude: /node_modules/,
				loader: 'babel-loader',
				options: {
					presets: [
						['@babel/preset-env', {
							targets:{
								esmodules:true
							},
							bugfixes:true,
							loose: true,
						}],
					],
					plugins: [
						['@babel/plugin-transform-react-jsx', {
							runtime: 'automatic',
							importSource: 'preact',
							useSpread: true,
						}],
					],
				},
			},
			{
				test: /\.css$/i,
				use: [MiniCssExtractPlugin.loader, 'css-loader'],
			},
		],
	},
	devServer: {
		port: 8000, // todo: remove
		contentBase: path.join(__dirname, 'dist'),
	},
}
