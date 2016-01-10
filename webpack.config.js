var webpack = require('webpack');
var path = require('path');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var CleanPlugin = require('clean-webpack-plugin');
var CopyPlugin = require('copy-webpack-plugin');

var config = {
  cache: true,

  entry:[
    'babel-polyfill',
    './src/app.js'
  ],

  output: {
    path: path.join(__dirname, 'dist'),
    // publicPath: 'dist/',
    filename: 'mme-bundle.js'
  },

  module: {
    loaders: [
      // Load JS(X) using Babel loader and a number of presets and plugins
      // for modern JS
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015', 'stage-0', 'react'],
          plugins: ['transform-runtime']
        }
      },
      // Load CSS through style-loader, css-loader and postcss-loader, and enable
      // CSS Modules + the use of PostCSS plugins
      {
        test: /\.css$/,
        loader: ExtractTextPlugin.extract('style-loader', [
          'css-loader?modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]',
          'postcss-loader',
          'autoprefixer-loader?{browsers: ["last 2 versions", "> 1%", "ie 9", "firefox >= 21", "safari >= 5"], cascade: false}'
        ].join('!'))
      },
      // Simply allow JSON to be loaded
      {
        test: /\.json$/,
        loader: 'json-loader',
      }
    ]
  },

  // PostCSS plugins
  // Note: CSS preprocessing comes with limitations, and generally only applies to
  // what can be determined or calculated ahead of time (e.g. what isn't dependent
  // on the page's dimensions)
  postcss: [
    require('postcss-custom-properties'), // Enable CSS custom props preprocessing
    require('postcss-calc') // Preprocess calc() functions
  ],

  plugins: [
    // Clean dist
    new CleanPlugin(['dist/**/*.*']),

    // Copy some non-bundled files over to dist
    new CopyPlugin([
      { from: 'src/index.html' },
      { from: 'src/favicon.ico' },
    ]),

    // Output CSS to a separate, CSS-only bundle
    new ExtractTextPlugin('mme-bundle.css')
  ]
};

module.exports = config;
