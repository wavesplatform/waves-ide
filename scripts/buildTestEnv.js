const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const autoprefixer = require('autoprefixer');
const path = require('path');

const OUT_PATH = path.resolve(__dirname, '..', 'build');
const MODE = process.argv[2] === 'prod' ? 'production' : 'development';

console.log(`Building environment script for testRunner in ${MODE} mode`);

webpack({
    entry: {
        testRunnerEnv: './src/services/testRunnerEnv.ts'
    },
    output: {
        filename: '[name].js',
        publicPath: '/',
        path: OUT_PATH
    },
    mode: MODE,
    plugins: [
        // new CleanWebpackPlugin('build'),
    ],
    resolve: {
        //Add '.ts' and '.tsx' as resolvable extensions.
        extensions: ['.ts', '.tsx', '.js', '.json', '.jsx', '.css']
    },
    optimization: {
        splitChunks: false,
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
                }
            })
        ]
    },
    module: {
        rules:[
            {
                test: /\.tsx?$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'ts-loader',
                        options: {
                            // transpileOnly: true,
                            // experimentalWatchApi: true,
                        },
                    },
                ],
            },
        ]
    }
}, (err, stats) => {
    if (err || stats.hasErrors()) {
        console.log(err, stats)
    }
    // Done processing
})