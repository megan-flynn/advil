const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

const outputDir = 'build';

module.exports = (_, argv) => {
  argv.private = {
    outputDir
  };
  const config = {
    entry: {
      background: './src/background/background.js',
      contentScript: './src/contentScript/contentScript.js'
    },
    output: {
      filename: '[name].js',
      path: path.resolve(__dirname, outputDir)
    },
    plugins: [
      new CleanWebpackPlugin([outputDir]),
      new CopyWebpackPlugin([{ from: 'static' }])
    ],
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: ['babel-loader']
        },
        { test: /\.svg$/, loader: 'url-loader' },
        {
          test: /\.less$/,
          use: [
            {
              loader: 'style-loader'
            },
            {
              loader: 'css-loader',
              options: {
                sourceMap: true,
                modules: true,
                localIdentName: '[local]___[hash:base64:5]'
              }
            },
            {
              loader: 'less-loader'
            }
          ]
        }
      ]
    },
    resolve: {
      extensions: ['*', '.js']
    }
  };

  return config;
};
