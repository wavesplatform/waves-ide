const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const autoprefixer = require('autoprefixer');
const path = require('path');

const OUT_PATH = path.resolve(__dirname, '..', 'build');

console.log(`Building ride-language-server LspService in production mode`);

webpack({
    mode: 'production',
    entry: './node_modules/@waves/ride-language-server/LspService.js',
    output: {
        filename: 'ride-language.bundle.js',
        publicPath: '/',
        path: OUT_PATH,
        library: 'RideLanguageServer',

    },
    externals: {
        '@waves/ride-js': 'RideJS'
    }
}, (err, stats) => {
    if (err || stats.hasErrors()) {
        console.log(err, stats)
    }
    // Done processing
});
