/**
 * Base webpack config used across other specific configs
 */

import path from 'path';
import validate from 'webpack-validator';

export default validate({
  module: {
    loaders: [{
      test: /\.jsx?$/,
      loaders: ['babel-loader'],
      exclude: /node_modules/
    }, {
      test: /(\.js|\.jsx)$/,
      loader: 'babel',
      include: [path.resolve(__dirname, './node_modules/react-icons/io')],
      query: {
          presets: ['es2015', 'react']
      }
    }, {
      test: /\.json$/,
      loader: 'json-loader'
    }, {
      test: /\.(jpe?g|png|gif|svg)$/i,
      loader: 'url?limit=10000!img?progressive=true'
    }]
  },

  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js',

    // https://github.com/webpack/webpack/issues/1114
    libraryTarget: 'commonjs2'
  },

  // https://webpack.github.io/docs/configuration.html#resolve
  resolve: {
    extensions: ['', '.js', '.jsx', '.json'],
    packageMains: ['webpack', 'browser', 'web', 'browserify', ['jam', 'main'], 'main']
  },

  plugins: [

  ],

  node: {
      fs: 'empty'
  },
  externals: [
    {
      './cptable': 'var cptable',
      './jszip': 'jszip'
    }
  ]
  // put your node 3rd party libraries which can't be built with webpack here
  // (mysql, mongodb, and so on..)
});
