const fs = require('fs');
const iconsFolder = './src/assets/img';
const stylePath = './src/styles/icons.less';

fs.readdir(iconsFolder, (err, files) => {
    const content = files.map(file => {
        let fileClass = file.replace('.svg', '')
        let data = fs.readFileSync(`${iconsFolder}/${file}`, 'utf8');
        let width = data.match(/width="(.+?)"/)[1];
        let height = data.match(/width="(.+?)"/)[1];
        return `.${fileClass}() {\n  background: url("../assets/img/${file}") center no-repeat;\n  width: ${width}px;\n  height: ${height}px;\n}\n\n`
    }).join('');
    try {
        fs.unlinkSync(stylePath);
    } catch (e) {
    }
    fs.appendFile(stylePath, (content), function (err) {
        if (err) throw err;
        console.log('✅ -> Styles were saved to ' + stylePath);
    });
});

