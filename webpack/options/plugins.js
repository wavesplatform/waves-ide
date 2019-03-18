const webpack = require('webpack');
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const s3 = require('webpack-s3-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const s3config = require('../../s3.config');

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

module.exports = [
    new HtmlWebpackPlugin({
        template: 'template.html',
        hash: true
    }),
    new CopyWebpackPlugin([
        {from: 'build'},
        {from: 'web'},
        {from: 'node_modules/@waves/ride-js/dist/ride.min.js'},
        {from: 'node_modules/react/umd/react.production.min.js'},
        {from: 'node_modules/react-dom/umd/react-dom.production.min.js'}
    ]),
    new CleanWebpackPlugin('dist'),
    new ForkTsCheckerWebpackPlugin()
].concat(conf.plugins);
