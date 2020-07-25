const path = require('path')
const CleanWebpackPlugin = require('clean-webpack-plugin')

const merge = require('webpack-merge')
const baseConfig = require('./webpack.base')

module.exports = merge(baseConfig, {
  output: {
    path: path.resolve(__dirname, '../lib'),
    filename: 'index.js',
    libraryTarget: 'umd', // 采用通用模块定义
    library: 'toolFunc', // 库名称
    libraryExport: 'default', // 兼容 ES6(ES2015) 的模块系统、CommonJS 和 AMD 模块规范
    globalObject: 'this' // 兼容node和浏览器运行，避免window is not undefined情况
  },
  plugins: [
    new CleanWebpackPlugin(
      ['lib'],
      {
        root: path.resolve(__dirname, '..'),
      }
    ),
  ],
  mode: 'production'
})
