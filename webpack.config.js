var libraryName = 'NwsApi';
var outputFile = libraryName + '.js';

const path = require('path');
const { library } = require('webpack');
//const CopyPlugin = require("copy-webpack-plugin");

var SRC_DIR = path.resolve(__dirname, './src');
var BUILD_DIR = path.resolve(__dirname, './dist');

module.exports = {
  entry: [SRC_DIR+'/index.js'],//SRC_DIR+'/development.js'],
  output: {
    filename: outputFile,
		path: BUILD_DIR,
		library: libraryName,
		libraryTarget: 'window',
		scriptType: 'text/javascript',
	},
	devServer: {
		port: 8080,
		hot:true,
		static: {
			watch: true, 
		},
		injectClient: false // via https://github.com/webpack/webpack-dev-server/issues/2484
	},
	devtool: 'inline-source-map',
};