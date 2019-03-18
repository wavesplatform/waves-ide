const path = require("path");

const moduleOption = require('./options/module');
const aliasOption = require('./options/alias');
const pluginsOption = require('./options/plugins');
const extensionsOption = require('./options/extensions');
const optimizationOption = require('./options/optimization');

const srcPath = path.resolve(__dirname, "../src/");
const distPath = path.resolve(__dirname, "../dist/");
const publicPath = path.resolve(__dirname, "/");

const entryFilePath = srcPath + "/index.tsx";

module.exports = {
    entry: [
        entryFilePath
    ],
    output: {
        filename: '[name].[chunkhash].bundle.js',
        path: distPath,
        publicPath: publicPath
    },
    resolve: {
        extensions: [...extensionsOption],
        alias: aliasOption
    },
    module: moduleOption,
    plugins: [...pluginsOption],
    optimization: optimizationOption,
    externals: {
        'react': 'React',
        'react-dom': 'ReactDOM',
        'monaco-editor': 'monaco',
        'monaco-editor/esm/vs/editor/editor.api': 'monaco',
        '@waves/ride-js': 'RideJS'
    },
    stats: {
        warningsFilter: /export .* was not found in/
    },
};
