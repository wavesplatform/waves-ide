const webpack = require('webpack');
const copy = require('copy-webpack-plugin');
const path = require('path');

const autoprefixer = require('autoprefixer');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const flavors = {
    prod: {
        mode: 'production',
        monacoPath: 'node_modules/monaco-editor/min/vs',
        plugins: [
            new webpack.DefinePlugin({
                'process.env.NODE_ENV': '"production"'
            })
        ],
    },
    dev: {
        mode: 'development',
        monacoPath: 'node_modules/monaco-editor/dev/vs',
        plugins: []
    },
    bundleAnalyze: {
        plugins: [
            new BundleAnalyzerPlugin()
        ]
    }
};

module.exports = (args) => {

    let flavorsInBuild = ['dev'];

    if (typeof args === 'string') {
        flavorsInBuild = args.split(',')
    }

    const notFound = flavorsInBuild.filter(f => !flavors[f]);
    if (notFound.length > 0) {
        console.log('\x1b[31m\033[1m%s\x1b[0m', `ERROR: [${notFound.join(', ')}] not found in flavors`);
        return {}
    }
    const conf = Object.assign({}, ...flavorsInBuild.map(f => flavors[f]));

    conf.plugins = flavorsInBuild.map(f => flavors[f].plugins).reduce((a, b) => a.concat(b));

    const outputPath = path.resolve(__dirname, 'dist');

    return {
        entry: {
            app: './src/index.tsx'
        },
        mode: conf.mode,
        output: {
            filename:'[name].[hash].bundle.js',
            // chunkFilename: '[name].[chunkhash].bundle.js',
            publicPath: '/',
            path: outputPath,
            pathinfo: false
        },
        plugins: [
            new copy([
                {from: 'build'},
                {from: 'web'},
                {from: 'src/assets', to: 'assets'},
                {from: 'node_modules/@waves/ride-js/dist/ride.min.js'},
                {from: 'node_modules/react/umd/react.production.min.js'},
                {from: 'node_modules/react-dom/umd/react-dom.production.min.js'}
            ]),
            new HtmlWebpackPlugin({
                template: 'template.html',
                hash: true,
                production: conf.mode === 'production'
            }),
            new CleanWebpackPlugin('dist'),
            new ForkTsCheckerWebpackPlugin(),
            new webpack.HotModuleReplacementPlugin()
        ].concat(conf.plugins),

        //Enable sourcemaps for debugging webpack's output.
        devtool: conf.mode === 'development' ? 'eval' : undefined,

        resolve: {
            //Add '.ts' and '.tsx' as resolvable extensions.
            extensions: ['.ts', '.tsx', '.js', '.json', '.jsx', '.css'],
            alias: {
                '@components': path.resolve(__dirname, "./src/components"),
                '@services': path.resolve(__dirname, "./src/services"),
                '@src': path.resolve(__dirname, "./src"),
                '@stores': path.resolve(__dirname, "./src/stores"),
                '@utils': path.resolve(__dirname, "./src/utils")
            }
        },
        stats: {
            warningsFilter: /export .* was not found in/
        },
        optimization: {
            minimize: true,
            minimizer: [
                new UglifyJsPlugin({
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
                    test: /\.(png|jpg|svg|gif)$/,
                    loader: "url-loader?limit=1000&name=assets/img/[name].[ext]",
                },
                {
                    test: /\.tsx?$/,
                    exclude: /node_modules/,
                    use: [
                        {
                            loader: 'ts-loader',
                            options: {
                                transpileOnly: true,
                                experimentalWatchApi: true,
                            },
                        },
                    ],
                },
                {
                    test: /\.less$/,
                    use: [
                        {loader: "style-loader"},
                        {
                            loader: "css-loader",
                            options: {
                                modules: true,
                                localIdentName: '[folder]__[local]--[hash:base64:5]',
                            }
                        },
                        {loader: "less-loader",
                            options: {
                                // modifyVars: themeVariables,
                                root: path.resolve(__dirname, './')
                            }
                        },
                    ]
                },
                {
                    include: /rc-select|rc-tree|react-perfect-scrollbar|rc-dialog|rc-notification|rc-dropdown|rc-menu|rc-tooltip|rc-tabs|src|repl|normalize|antd/,
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
            ]
        },
        externals: {
            'react': 'React',
            'react-dom': 'ReactDOM',
            'monaco-editor': 'monaco',
            'monaco-editor/esm/vs/editor/editor.api': 'monaco',
            '@waves/ride-js': 'RideJS'
        },
        devServer: {
            hot: true,
            historyApiFallback: true
        }
    }
};
