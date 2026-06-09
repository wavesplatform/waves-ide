const webpack = require('webpack');
const path = require('path');

const OUT_PATH = path.resolve(__dirname, '..', 'build');

console.log(`Building ride-language-server LspService in production mode`);

webpack({
    mode: 'production',
    entry: require.resolve('@waves/ride-language-server/LspService.js'),
    output: {
        filename: 'ride-language.bundle.js',
        publicPath: '/',
        path: OUT_PATH,
        library: 'RideLanguageServer',
        clean: false
    }
}, (err, stats) => {
    if (err || stats.hasErrors()) {
        console.log(err, stats)
    }
    // Done processing
});


