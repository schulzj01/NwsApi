

const path = require('path');
const webpack = require('webpack');
//const CopyPlugin = require("copy-webpack-plugin");

const srcDir = path.resolve(__dirname, './src');
const buildDir = path.resolve(__dirname, './dist');

const pkg = require('./package.json')
const version = pkg.version;

const libraryName = 'NwsApi';
const outputFile = `${libraryName}.js`;

module.exports = {
  entry: [srcDir+'/index.js'],//SRC_DIR+'/development.js'],
  output: {
    filename: outputFile,
		path: buildDir,
		library: libraryName,
		libraryTarget: 'window',
		scriptType: 'text/javascript',
	},
	devServer: {
		port: 8080,
		static: srcDir,
		hot:true, //'only',
		open: true,
		https:true,

		/*static: {
			watch: true,
		},*/
		//injectClient: false // via https://github.com/webpack/webpack-dev-server/issues/2484
	},
/*  plugins: [
    new webpack.BannerPlugin({
			banner: `Version:  ${version}\n\nAuthor: Jeremy.Schulz@noaa.gov\n\n`,
			entryOnly: true,
			extractComments: false
		})
  ]	*/
	//devtool: 'inline-source-map',
};