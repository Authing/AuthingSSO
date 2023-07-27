const path = require('path')

const HtmlWebpackPlugin = require('html-webpack-plugin')

const resolve = function (...args) {
  return path.resolve(__dirname, ...args)
}

module.exports = {
  mode: 'development',
  entry: resolve('./src/example.ts'),
  module: {
    rules: [
      {
        test: /\.(js|mjs|jsx|ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              [
                '@babel/preset-env',
                {
                  targets: {
                    chrome: '49',
                    ie: '11',
                  },
                  useBuiltIns: 'usage',
                  corejs: {
                    version: 3, // 使用core-js@3
                    proposals: true,
                  },
                },
              ],
              '@babel/preset-typescript',
            ],
            plugins: [
              '@babel/plugin-transform-runtime',
              '@babel/plugin-transform-arrow-functions',
            ],
          },
        },
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: resolve('./src/index.html'),
      filename: 'index.html'
    })
  ],
  devServer: {
    host: 'localhost',
    port: 3004,
    hot: true,
    open: true
  }
}
