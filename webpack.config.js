const webpack = require('webpack');
const copy = require('copy-webpack-plugin');
const s3 = require('webpack-s3-plugin');
const path = require('path');
const fs = require('fs');
const s3config = require('./s3.config');
const autoprefixer = require('autoprefixer');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;


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
    deploy: (isDev) => {
        const flag = isDev?'dev':'prod';
        return  {plugins: [
                new s3({
                    s3Options: {
                        accessKeyId: s3config[flag].accessKeyId,
                        secretAccessKey: s3config[flag].secretAccessKey,
                        region: s3config[flag].region,
                        //signatureVersion: 'v4'
                    },
                    s3UploadOptions: {
                        Bucket: s3config[flag].bucket,
                        ACL: 'public-read',
                    },
                    cloudfrontInvalidateOptions: {
                        DistributionId: s3config[flag].cloudfrontDitstibutionId,
                        Items: ["/*"]
                    }
                })
            ]
        }
    }
}

module.exports = (args) => {

    var flavorsInBuild = ['dev']


    if (typeof args === 'string') {
        flavorsInBuild = args.split(',')
    }

    const notFound = flavorsInBuild.filter(f => !flavors[f])
    if (notFound.length > 0) {
        console.log('\x1b[31m\033[1m%s\x1b[0m', `ERROR: [${notFound.join(', ')}] not found in flavors`)
        return {}
    }
    const conf = Object.assign({}, ...flavorsInBuild.map(f => {
    if(f === 'deploy')
        return flavors[f](flavorsInBuild.indexOf('dev') > -1)
    else
        return flavors[f]
    }))
    conf.plugins = flavorsInBuild.map(f => flavors[f].plugins).reduce((a, b) => a.concat(b))
    const outputPath = path.resolve(__dirname, 'dist')

    return {
        entry: ['./src/index.tsx'],
        mode: conf.mode,
        output: {
            filename: '[name].[chunkhash].bundle.js',
            chunkFilename: '[name].[chunkhash].bundle.js',
            publicPath: '/',
            path: outputPath,
            pathinfo: false
        },
        plugins: [
            new copy([
                //{from: conf.monacoPath, to: 'vs',},
                {from: 'web'},
                {from: 'node_modules/react/umd/react.production.min.js'},
                {from: 'node_modules/react-dom/umd/react-dom.production.min.js'}
            ]),
            new HtmlWebpackPlugin({
                template: 'template.html',
                hash: true,
                production: conf.mode === 'production'
            }),
            new ForkTsCheckerWebpackPlugin(),
            new MonacoWebpackPlugin({
                languages: ["javascript", "typescript", "json", "ride"]
            }),
           // new BundleAnalyzerPlugin()
        ].concat(conf.plugins),

        //Enable sourcemaps for debugging webpack's output.
        //devtool: 'inline-source-map',

        resolve: {
            //Add '.ts' and '.tsx' as resolvable extensions.
            extensions: ['.ts', '.tsx', '.js', '.json', '.jsx', '.css']
        },
        stats: {
            warningsFilter: /export .* was not found in/
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
                {
                    test: /\.tsx?$/,
                    exclude: /node_modules/,
                    use: [
                        {
                            loader: 'awesome-typescript-loader',
                            options: {
                                useCache: true,
                                experimentalWatchApi: true,
                            },
                        },
                    ],
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
            'react': 'React',
            'react-dom': 'ReactDOM'
        },
        devServer: {
            historyApiFallback: true
        }
    }
}