const webpack = require('webpack')
const copy = require('copy-webpack-plugin')
const s3 = require('webpack-s3-plugin')
const tmpl = require('blueimp-tmpl')
const path = require('path')
const fs = require('fs')
const s3config = require('./s3.config')
const autoprefixer = require('autoprefixer')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin');

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
                    //signatureVersion: 'v4'
                },
                s3UploadOptions: {
                    Bucket: s3config.bucket,
                    ACL: 'public-read',
                },
                cloudfrontInvalidateOptions: {
                    DistributionId: s3config.cloudfrontDitstibutionId,
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
        entry: ['babel-polyfill', './src/index.tsx'],
        mode: conf.mode,
        output: {
            filename: '[name].chunkhash.bundle.js',
            chunkFilename: '[name].chunkhash.bundle.js',
            publicPath: '/',
            path: outputPath
        },
        plugins: [
            new copy([
                {from: conf.monacoPath, to: 'vs',},
                {from: 'web'},
                // {from: 'node_modules/react/umd/react.production.min.js'},
                // {from: 'node_modules/react-dom/umd/react-dom.production.min.js'}
            ]),
            // {
            //     apply: (compiler) =>
            //         compiler.plugin('emit', function (compilation, callback) {
            //             fs.readFile('template.html', {encoding: 'utf8'}, (err, template) => {
            //                 const index = tmpl(template, {prod: flavorsInBuild.includes('prod')})
            //                 compilation.assets['index.html'] = {
            //                     source: () => new Buffer(index),
            //                     size: () => Buffer.byteLength(index)
            //                 }
            //                 callback()
            //             })
            //         })
            // },
            new HtmlWebpackPlugin({
                template: 'template.html',
                hash: true
            })
        ].concat(conf.plugins),

        //Enable sourcemaps for debugging webpack's output.
        //devtool: 'source-map',

        resolve: {
            //Add '.ts' and '.tsx' as resolvable extensions.
            extensions: ['.ts', '.tsx', '.js', '.json', '.jsx', '.css']
        },

        optimization: {
            minimize: true,
            splitChunks: {
                cacheGroups: {
                    vendor: {
                        test: /node_modules/,
                        chunks: 'initial',
                        name: 'vendor',
                        enforce: true
                    },
                }
            },
            minimizer: [
                new UglifyJsPlugin({
                    exclude: /waves.ts/,
                    uglifyOptions: {
                        compress: {
                            sequences: true,
                            dead_code: true,
                            conditionals: true,
                            booleans: true,
                            unused: true,
                            if_return: true,
                            join_vars: true,
                            drop_console: true
                        },
                        mangle: {reserved: ['(keyPairOrSeed|env|name|description|decimals|reissuable|quantity|amount|assetId|attachment|feeAssetId|amount|recipient|txId|fee|timestamp|version|chainId|alias|transfers|script|fee|timestamp|version|seed|tx)']},
                    }
                })
            ]
        },

        module: {
            rules: [
                {test: /\.tsx?$/, loader: 'awesome-typescript-loader'},

                {
                    test: /.jsx?$/,
                    loader: 'babel-loader',
                    //exclude: /node_modules/,
                    include: [
                        path.resolve(__dirname, "src"),
                        path.resolve(__dirname, "node_modules/waves-repl")
                    ],
                    // query: {
                    //   presets: ['es2015', 'react']
                    // }
                    options: {
                        presets: ['react', 'es2015'],
                        plugins: ['babel-plugin-transform-es2015-destructuring', 'transform-object-rest-spread']
                    }
                },
                {
                    test: /\.css$/,
                    use: [
                        require.resolve('style-loader'),
                        {
                            loader: require.resolve('css-loader'),
                            options: {
                                importLoaders: 1,
                            },
                        },
                        {
                            loader: require.resolve('postcss-loader'),
                            options: {
                                // Necessary for external CSS imports to work
                                // https://github.com/facebookincubator/create-react-app/issues/2677
                                ident: 'postcss',
                                plugins: () => [
                                    require('postcss-flexbugs-fixes'),
                                    require('postcss-inline-svg'),
                                    autoprefixer({
                                        browsers: [
                                            '>1%',
                                            'last 4 versions',
                                            'Firefox ESR',
                                            'not ie < 9', // React doesn't support IE8 anyway
                                        ],
                                        flexbox: 'no-2009',
                                    }),
                                ],
                            },
                        },
                    ],
                },
                {enforce: 'pre', test: /\.js$/, loader: 'source-map-loader'}
            ]
        },

        externals: {
            // 'react': 'React',
            // 'react-dom': 'ReactDOM'
        },
        devServer: {
            historyApiFallback: true
        }
    }
}