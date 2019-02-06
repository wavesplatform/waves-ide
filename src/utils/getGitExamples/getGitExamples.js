const axios = require('axios')
const fs = require('fs')

const path = 'src/utils/getGitExamples/'//  ‼️ required "/" at the end

const getUrl = (dir, file) => `https://api.github.com/repos/wavesplatform/ride-examples/contents//${dir}/${file ? file : ""}`;
const getExportСoquille = (json) => `export default function () { return ${json} }`;

function getCateg(category) {
    return axios.get(getUrl(category))
        .then(response => response.data)
        .then(response => {
            let out = [];
            for (let i in response) out.push({name: response[i].name, url: response[i].url, dir: category})
            return out
        })
        .catch((error) => {
            console.log(error)
        });
}

function getFileByUrl(input) {
    return axios.get(input.url).then(response => response.data).then(response => {
        let content = Buffer.from(response.content, 'base64').toString()
        return {name: input.name, dir: input.dir, content: content}
    }).catch((error) => {
        console.log('❌ -> Git examples was failed: ' + error);
    })
}

function getDirData(dir) {
    return getCateg(dir).then(data => {
        let promises = [];
        for (let i in data) {
            promises.push(getFileByUrl(data[i]))
        }
        return Promise.all(promises).then(result => result)
    })
}

Promise.all([getDirData('smart-accounts'), getDirData('smart-assets')]).then(data => {
    let out = {}
    for (let i in data) {
        for (let j in data[i]) {
            if (!out[data[i][j].dir]) out[data[i][j].dir] = []
            out[data[i][j].dir].push(data[i][j])
        }
    }
    // console.log(out)
    let filePath = path + 'gitExamples.js';
    try {
        fs.unlinkSync(filePath);
    } catch (e) {
    }
    fs.appendFile(filePath, getExportСoquille(JSON.stringify(out)), function (err) {
        if (err) throw err;
        console.log('✅ -> Git examples was saved to ' + filePath);
    });

}).catch(e => console.log('❌ -> Git examples was failed: ' + error))
