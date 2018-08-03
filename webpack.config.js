const webpack = require('webpack')
const copy = require('copy-webpack-plugin')
const s3 = require('webpack-s3-plugin')
const tmpl = require('blueimp-tmpl')
const path = require('path')
const fs = require('fs')
const s3config = require('./s3.config')

const flavors = {
  prod: {
    mode: 'production',
    monacoPath: 'node_modules/monaco-editor/min/vs',
    plugins: [
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': '"production"'
      }),
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
          region: s3config.region,
          signatureVersion: 'v4'
        },
        s3UploadOptions: {
          Bucket: s3config.bucket,
          ACL: 'public-read',
        },
        cloudfrontInvalidateOptions: {
          //DistributionId: process.env.CLOUDFRONT_DISTRIBUTION_ID,
          Items: ["/*"]
        }
      })
    ]
  }
}

module.exports = (args) => {
  var flavorsInBuild = ['dev']
  if (typeof args == 'string') {
    flavorsInBuild = args.split(',')
  }

  const notFound = flavorsInBuild.filter(f => !flavors[f])
  if (notFound.length > 0) {
    console.log('\x1b[31m\033[1m%s\x1b[0m', `ERROR: [${notFound.join(', ')}] not found in flavors`)
    return {}
  }
  const conf = Object.assign({}, ...flavorsInBuild.map(f => flavors[f]))
  conf.plugins = flavorsInBuild.map(f => flavors[f].plugins).reduce((a, b) => a.concat(b))
  const outputPath = path.resolve(__dirname, 'dist')

  return {
    entry: './src/index.tsx',
    mode: conf.mode,
    output: {
      filename: 'bundle.js',
      path: outputPath
    },
    plugins: [
      new copy([
        { from: conf.monacoPath, to: 'vs', },
        { from: 'repl/css', to: 'repl/css' },
        { from: 'repl/static', to: 'repl/static' },
        { from: 'repl/*.svg', to: 'console', flatten: true },
        { from: 'web' },
        { from: 'node_modules/react/umd/react.production.min.js' },
        { from: 'node_modules/react-dom/umd/react-dom.production.min.js' }
      ]),
      {
        apply: (compiler) =>
          compiler.plugin('emit', function (compilation, callback) {
            fs.readFile('template.html', { encoding: 'utf8' }, (err, template) => {
              const index = tmpl(template, { prod: flavorsInBuild.includes('prod') })
              compilation.assets['index.html'] = {
                source: () => new Buffer(index),
                size: () => Buffer.byteLength(index)
              }
              callback()
            })
          })
      }
    ].concat(conf.plugins),

    //Enable sourcemaps for debugging webpack's output.
    //devtool: 'source-map',

    resolve: {
      //Add '.ts' and '.tsx' as resolvable extensions.
      extensions: ['.ts', '.tsx', '.js', '.json', '.jsx']
    },

    module: {
      rules: [
        { test: /\.tsx?$/, loader: 'awesome-typescript-loader' },
        { enforce: 'pre', test: /\.js$/, loader: 'source-map-loader' }
      ]
    },

    externals: {
      'react': 'React',
      'react-dom': 'ReactDOM'
    },
  }
}