const autoprefixer = require('autoprefixer');

const javascripts = {
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
    ]
};

const stylesheets = {
    test: /\.css$/,
    include: /src|repl|normalize/,
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
    
};

module.exports = {
    rules: [
        javascripts,
        stylesheets
    ]
};
