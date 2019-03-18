const merge = require('webpack-merge');

const commonConfig = require('./common.js');

module.exports = merge(commonConfig, {
    mode: "production"
});
