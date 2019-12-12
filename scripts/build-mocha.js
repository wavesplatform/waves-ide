const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const autoprefixer = require('autoprefixer');
const path = require('path');

const OUT_PATH = path.resolve(__dirname, '..', 'build');
const MODE = process.argv[2] === 'prod' ? 'production' : 'development';

console.log(`Building mocha in ${MODE} mode`);

webpack({
    entry: {
        mocha: './node_modules/mocha/mocha.js'
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
        splitChunks: false
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
                            transpileOnly: true,
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
