const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');
const autoprefixer = require('autoprefixer');
const path = require('path');

const OUT_PATH = path.resolve(__dirname, '..', 'build');
const MODE = process.argv[2] === 'prod' ? 'production' : 'development';

console.log(`Building MonacoEditor in ${MODE} mode`);

webpack({
    entry: {
        editor: 'monaco-editor/esm/vs/editor/editor.main.js',
        "editor.worker": 'monaco-editor/esm/vs/editor/editor.worker.js',
        "json.worker": 'monaco-editor/esm/vs/language/json/json.worker',
        "css.worker": 'monaco-editor/esm/vs/language/css/css.worker',
        "html.worker": 'monaco-editor/esm/vs/language/html/html.worker',
        "ts.worker": 'monaco-editor/esm/vs/language/typescript/ts.worker'
    },
    output: {
        filename: '[name].bundle.js',
        publicPath: '/',
        path: OUT_PATH,
        clean: false,
        library: {
            name: 'monaco',
            type: 'var',
        },
        globalObject: 'self',
    },
    mode: MODE,
    plugins: [],
    resolve: {
        //Add '.ts' and '.tsx' as resolvable extensions.
        extensions: ['.ts', '.tsx', '.js', '.json', '.jsx', '.css']
    },
    optimization: {
        splitChunks: false,
        minimize: true,
        minimizer: [new TerserPlugin()]
    },
    module: {
        rules:[
            {
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
                            postcssOptions: {
                                plugins: [
                                    require('postcss-flexbugs-fixes'),
                                    require('postcss-inline-svg'),
                                    autoprefixer({
                                        overrideBrowserslist: [
                                            '>1%',
                                            'last 4 versions',
                                            'Firefox ESR',
                                            'not ie < 9',
                                        ],
                                        flexbox: 'no-2009',
                                    }),
                                ],
                            },
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
