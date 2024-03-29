const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const entry = ['./src/index.js'];

if (process.env.NODE_ENV === 'development') {
  entry.push('./src/testUtils.js');
}

const config = {
  entry,
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'wiredVoices.js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: 'babel-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
        ],
      },
      {
        test: /\.scss$/,
        use: [
          'style-loader',
          'css-loader',
          'sass-loader',
        ],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
      filename: 'index.html',
    }),
  ],
};

module.exports = config;
