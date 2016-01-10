var webpack = require('webpack');
var webpackDevConfig = require('./webpack.config.js');

webpackDevConfig.plugins.unshift(
  new webpack.DefinePlugin({
    'process.env': {
      'NODE_ENV': JSON.stringify('production'),
    }
  })
);

module.exports = webpackDevConfig;
