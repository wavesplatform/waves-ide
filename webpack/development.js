const merge = require('webpack-merge');

const commonConfig = require('./common.js');

const port = process.env.PORT || 8080;

module.exports = merge(commonConfig, {
    mode: "development",
    devtool: "source-map",
    devServer: {
        historyApiFallback: true,
        port
    },
    watch: false
});
