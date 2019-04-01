const fs = require('fs');
const iconsFolder = './src/assets/img';
const stylePath = './src/styles/icons.less';
const mixinPath = './src/styles/iconsMixins.less';

fs.readdir(iconsFolder, (err, files) => {
    const content = files.map(file => {
        let fileClass = file.replace('.svg', '')
        let data = fs.readFileSync(`${iconsFolder}/${file}`, 'utf8');
        let width = data.match(/width="(.+?)"/)[1];
        let height = data.match(/width="(.+?)"/)[1];
        return {
            style: `:global .${fileClass} {\n  background: url("../assets/img/${file}") center no-repeat;\n  width: ${width}px;\n  height: ${height}px;\n}\n\n`,
            mixin: ` .${fileClass}() {\n  background: url("../assets/img/${file}") center no-repeat;\n  width: ${width}px;\n  height: ${height}px;\n}\n\n`
        }
    });
    try {
        fs.unlinkSync(stylePath);
        fs.unlinkSync(mixinPath);
    } catch (e) {
    }

    saveFile(stylePath, content.map(data => data.style).join(''));
    saveFile(mixinPath, content.map(data => data.mixin).join(''));
});

function saveFile(path, content) {
    fs.appendFile(path, (content), function (err) {
        if (err) throw err;
        console.log('✅ -> Styles were saved to ' + path);
    });
}
