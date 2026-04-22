const webpack = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const flavors = {
    prod: {
        mode: 'production',
        plugins: [
            new webpack.DefinePlugin({
                'process.env.NODE_ENV': JSON.stringify('production')
            }),
            new MiniCssExtractPlugin({ filename: '[name].[contenthash].css' })
        ]
    },
    dev: {
        mode: 'development',
        plugins: []
    },
    bundleAnalyze: {
        plugins: [new BundleAnalyzerPlugin()]
    }
};

module.exports = (args) => {
    let flavorsInBuild = ['dev'];

    if (typeof args === 'string') {
        flavorsInBuild = args.split(',');
    }

    const notFound = flavorsInBuild.filter((f) => !flavors[f]);
    if (notFound.length > 0) {
        console.log(`ERROR: [${notFound.join(', ')}] not found in flavors`);
        return {};
    }

    const conf = Object.assign({}, ...flavorsInBuild.map((f) => flavors[f]));
    conf.plugins = flavorsInBuild.map((f) => flavors[f].plugins).reduce((a, b) => a.concat(b), []);

    const outputPath = path.resolve(__dirname, 'dist');
    const isProduction = conf.mode === 'production';

    return {
        entry: {
            app: path.resolve(__dirname, 'src/index.tsx')
        },
        mode: conf.mode,
        output: {
            filename: '[name].[contenthash].bundle.js',
            publicPath: '/',
            path: outputPath,
            pathinfo: false,
            clean: true
        },
        plugins: [
            new CopyPlugin({
                patterns: [
                    { from: 'build', noErrorOnMissing: true },
                    { from: 'src/assets', to: 'assets' }
                ]
            }),
            new HtmlWebpackPlugin({
                template: 'template.html',
                hash: true,
                production: isProduction
            })
        ].concat(conf.plugins),
        devtool: isProduction ? false : 'eval-cheap-module-source-map',
        resolve: {
            extensions: ['.ts', '.tsx', '.js', '.json', '.jsx', '.css'],
            fallback: {
                stream: require.resolve('stream-browserify')
            },
            alias: {
                '@components': path.resolve(__dirname, './src/components'),
                '@services': path.resolve(__dirname, './src/services'),
                '@src': path.resolve(__dirname, './src'),
                '@stores': path.resolve(__dirname, './src/stores'),
                '@utils': path.resolve(__dirname, './src/utils'),

                '@waves/js-test-env/augment$': require.resolve('@waves/js-test-env/dist/augment.js'),
                '@waves/ride-language-server/suggestions$': require.resolve('@waves/ride-language-server/server/out/suggestions/index.js'),
            }
        },
        ignoreWarnings: [/export .* was not found in/],
        module: {
            rules: [
                {
                    test: /\.(png|jpg|svg|gif)$/i,
                    type: 'asset',
                    parser: {
                        dataUrlCondition: {
                            maxSize: 1000
                        }
                    },
                    generator: {
                        filename: 'assets/img/[name][ext]'
                    }
                },
                {
                    test: /\.tsx?$/,
                    exclude: /node_modules/,
                    use: [
                        {
                            loader: 'ts-loader',
                            options: {
                                transpileOnly: true,
                                experimentalWatchApi: true
                            }
                        }
                    ]
                },
                {
                    test: /\.less$/,
                    use: [
                        isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
                        {
                            loader: 'css-loader',
                            options: {
                                modules: {
                                    localIdentName: '[folder]__[local]--[hash:base64:5]',
                                    namedExport: false,
                                    exportLocalsConvention: 'camel-case'
                                },
                                esModule: true
                            }
                        },
                        {
                            loader: 'less-loader',
                            options: {
                                lessOptions: {
                                    paths: [path.resolve(__dirname, './')]
                                }
                            }
                        }
                    ]
                },
                {
                    test: /\.css$/,
                    include: /rc-collapse|rc-select|rc-tree|rc-dialog|rc-notification|rc-dropdown|rc-menu|rc-tooltip|rc-tabs|src|repl|normalize|antd/,
                    use: [
                        'style-loader',
                        {
                            loader: 'css-loader',
                            options: {
                                importLoaders: 1
                            }
                        },
                        {
                            loader: 'postcss-loader',
                            options: {
                                postcssOptions: {
                                    plugins: [
                                        require('postcss-flexbugs-fixes'),
                                        require('postcss-inline-svg')
                                    ]
                                }
                            }
                        }
                    ]
                }
            ]
        },
        externals: {
            'monaco-editor': 'monaco',
            'monaco-editor/esm/vs/editor/editor.api': 'monaco'
        },
        devServer: {
            hot: true,
            historyApiFallback: true,
            proxy: [
                {
                    context: ['/api'],
                    target: 'http://localhost:3000',
                }
            ],
        },
        optimization: {
            minimize: isProduction
        }
    };
};
