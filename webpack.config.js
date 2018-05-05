const webpack = require('webpack')
const copy = require('copy-webpack-plugin')
const s3 = require('webpack-s3-plugin')
const minify = require('babel-minify-webpack-plugin')
const path = require('path')
const s3config = require('./s3.config')

const flavorsInBuild = ['dev']

const flavors = {
  prod: {
    mode: 'production',
    monacoPath: 'node_modules/monaco-editor/min/vs',
    plugins: [
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': 'production'
      }),
      new minify(),
    ],
  },
  dev: {
    mode: 'development',
    monacoPath: 'node_modules/monaco-editor/dev/vs',
    plugins: []
  },
  deploy: {
    plugins: [
      new s3({
        s3Options: {
          accessKeyId: s3config.accessKeyId,
          secretAccessKey: s3config.secretAccessKey,
          region: s3config.region
        },
        s3UploadOptions: {
          Bucket: s3config.bucket,
          ACL: 'public-read'
        },
      })
    ]
  }
}

const conf = Object.assign({}, ...flavorsInBuild.map(f => flavors[f]))
conf.plugins = flavorsInBuild.map(f => flavors[f].plugins).reduce((a, b) => a.concat(b))

module.exports = {
  entry: './src/index.tsx',
  mode: conf.mode,
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  plugins: [
    new copy([
      { from: conf.monacoPath, to: 'vs', },
      { from: 'web' }
    ]),
  ].concat(conf.plugins),

  //Enable sourcemaps for debugging webpack's output.
  //devtool: 'source-map',

  resolve: {
    //Add '.ts' and '.tsx' as resolvable extensions.
    extensions: ['.ts', '.tsx', '.js', '.json']
  },

  module: {
    rules: [
      { test: /\.tsx?$/, loader: 'awesome-typescript-loader' },
      // { enforce: 'pre', test: /\.js$/, loader: 'source-map-loader' }
    ]
  },

  externals: {
    'react': 'React',
    'react-dom': 'ReactDOM'
  },
};