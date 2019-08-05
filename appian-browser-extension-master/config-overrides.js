const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const WriteFilePlugin = require('write-file-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  webpack: function(config, env) {
    config.optimization.runtimeChunk = false;
    config.optimization.splitChunks = false;

    // Add additional entry points
    const entryOrig = config.entry;
    config.entry = {
      bundle: entryOrig,
      eventPage: entryOrig.map((el, index) => {
        return index + 1 === entryOrig.length
          ? './src/eventPage/eventPage.js'
          : el;
      }),
      gmail: './src/contentScript/gmail/gmail.js',
      embeddedScript: './src/embedded-script/embeddedScript'
    };

    // No chunk in output filename
    config.output.filename = config.output.filename
      .replace('[chunkhash:8].', '')
      .replace('bundle.js', '[name].js');

    // Only include bundle entrypoint in the index.html scripts
    // Other chunks are for other uses
    config.plugins = config.plugins
      .map(plugin => {
        if (plugin instanceof HtmlWebpackPlugin) {
          plugin.options.chunks = ['bundle'];
          return plugin;
        } else {
          return plugin;
        }
      })
      .concat(
        new HtmlWebpackPlugin({
          filename: 'testEntry.html',
          template: 'src/embedded-script/testEntry.html',
          chunks: ['embeddedScript']
        })
      );

    if (process.env.NODE_ENV === 'development') {
      // Pick a different port than 3000 just to avoid collisions
      process.env.PORT = 3030;

      config.plugins = (config.plugins || []).concat([
        // For chrome extensions, the file have to exist on disk, so use WriteFilePlugin
        new WriteFilePlugin(),
        // create-react-app copies static files over as separate step during build,
        // so we'll copy them explicitly during development run
        new CopyWebpackPlugin([
          {
            from: path.join(__dirname, 'public')
          }
        ])
      ]);

      config.devtool = 'inline-source-map';

      // Set the path and delete publicPath because we don't want a relative path here
      config.output.path = path.join(__dirname, 'build');
      delete config.output.publicPath;

      // Add the magic webpack-dev-server entries we need, removing the webpackHotDevClient
      // that create-react-app put in there.
      Object.keys(config.entry)
        .filter(key => key != 'gmail')
        .forEach(key => {
          config.entry[key] = [
            'webpack-dev-server/client?http://localhost:' + process.env.PORT,
            'webpack/hot/dev-server'
          ]
            .concat(config.entry[key])
            .filter(entry => entry.indexOf('webpackHotDevClient') < 0);
        });
    }

    return config;
  },
  devServer: configFunction => (proxy, allowedHost) => {
    const config = configFunction(proxy, allowedHost);
    config.port = 3030;
    config.historyApiFallback = {
      disableDotRule: true,
      index: 'testEntry.html'
    };

    return config;
  }
};
