const webpack = require('webpack');
const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const WriteFilePlugin = require('write-file-webpack-plugin');

const port = 4040;

module.exports = (env, argv) => {
  const config = merge(common(env, argv), {
    mode: 'development',
    devtool: 'inline-source-map', // 'cheap-module-eval-source-map'
    devServer: {
      contentBase: argv.private.outputDir,
      inline: false,
      hot: true,
      disableHostCheck: true,
      port
    },
    plugins: [new WriteFilePlugin(), new webpack.HotModuleReplacementPlugin()]
  });

  Object.keys(config.entry).forEach(key => {
    // Exclude content script from hot module replacement.
    // It runs in the context of the page and can't access the HMR port.
    if (key !== 'contentScript') {
      config.entry[key] = [
        'webpack-dev-server/client?http://localhost:' + port,
        'webpack/hot/dev-server'
      ].concat(config.entry[key]);
    }
  });

  return config;
};
