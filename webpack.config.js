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
const CleanWebpackPlugin = require('clean-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

// const lessToJs = require('less-vars-to-js');
// const themeVariables = lessToJs(fs.readFileSync(path.join(__dirname, './src/new_components/Explorer/styles.less'), 'utf8'));

// lessToJs does not support @icon-url: "some-string", so we are manually adding it to the produced themeVariables js object here
// themeVariables["@icon-url"] = "'http://localhost:8080/fonts/iconfont'";

const createS3Plugin = (isDev) => new s3({
    s3Options: {
        accessKeyId: s3config.accessKeyId,
        secretAccessKey: s3config.secretAccessKey,
        region: s3config.region,
        //signatureVersion: 'v4'
    },
    s3UploadOptions: {
        Bucket: isDev ? s3config.devBucket : s3config.bucket,
        ACL: 'public-read',
    },
    cloudfrontInvalidateOptions: {
        DistributionId: isDev ? s3config.devCloudFrontDistribution : s3config.cloudfrontDitstibutionId,
        Items: ["/*"]
    }
});

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
    deploy: {
        plugins: [
            createS3Plugin()
        ]
    },
    deployTest: {
        plugins: [
            createS3Plugin(true)
        ]
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
            filename: '[name].[chunkhash].bundle.js',
            // chunkFilename: '[name].[chunkhash].bundle.js',
            publicPath: '/',
            path: outputPath,
            pathinfo: false
        },
        plugins: [
            new copy([
                {from: 'build'},
                {from: 'web'},
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
            new ForkTsCheckerWebpackPlugin()
        ].concat(conf.plugins),

        //Enable sourcemaps for debugging webpack's output.
        devtool: conf.mode === 'development' ? 'eval' : undefined,

        resolve: {
            //Add '.ts' and '.tsx' as resolvable extensions.
            extensions: ['.ts', '.tsx', '.js', '.json', '.jsx', '.css'],
            alias: {
                '@components': path.resolve(__dirname, "./src/components"),
                '@selectors': path.resolve(__dirname, "./src/selectors"),
                '@src': path.resolve(__dirname, "./src"),
                '@store': path.resolve(__dirname, "./src/store"),
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
                    loader: 'babel-loader',
                    exclude: /node_modules/,
                    test: /\.js$/,
                    options: {
                        presets: [
                            ['env', {modules: false, targets: {browsers: ['last 2 versions']}}],
                            'react'
                        ],
                        cacheDirectory: true,
                        plugins: [
                            ['import', { libraryName: "antd", style: true }],
                            'transform-strict-mode',
                            'transform-object-rest-spread'
                        ]
                    },
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
                    include: /src|repl|normalize/,
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
                {
                    test: /\.less$/,
                    use: [
                        {loader: "style-loader"},
                        {
                            loader: "css-loader",
                            options: {
                                modules: true,
                                localIdentName: '[folder]__[local]--[hash:base64:5]', // '[local]'
                            }
                        },
                        {loader: "less-loader",
                            options: {
                                // modifyVars: themeVariables,
                                root: path.resolve(__dirname, './')
                            }
                        }
                    ]
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
            historyApiFallback: true
        }
    }
};
