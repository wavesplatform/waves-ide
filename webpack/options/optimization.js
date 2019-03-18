const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
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
                mangle: {
                    reserved: ['(keyPairOrSeed|env|name|description|decimals|reissuable|quantity|amount|assetId|attachment|feeAssetId|amount|recipient|txId|fee|timestamp|version|chainId|alias|transfers|script|fee|timestamp|version|seed|tx)']
                },
            }
        })
    ]
};
