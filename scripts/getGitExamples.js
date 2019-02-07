const axios = require('axios');
const fs = require('fs');

const path = 'src/';//  ‼️ required "/" at the end

const getUrl = (dir, file) => `https://api.github.com/repos/wavesplatform/ride-examples/contents//${dir}/${file ? file : ""}`;

const categories = ['smart-accounts', 'smart-assets']

function getCateg(category) {
    return axios.get(getUrl(category))
        .then(response => response.data)
        .then(response => {
            return response.map((value) => {
                return {name: value.name, url: value.url, dir: category}
            })
        })
        .catch((error) => {
            console.log(error)
        });
}

function getFileByUrl(input) {
    return axios.get(input.url)
        .then(response => response.data)
        .then(response => {
            let content = Buffer.from(response.content, 'base64').toString();
            return {name: input.name, dir: input.dir, content: content}
        }).catch((error) => {
            console.log('❌ -> Git examples was failed: ' + error);
        })
}

function getDirData(dir) {
    return getCateg(dir).then(data =>
        Promise.all(data.map(value => getFileByUrl(value))).then(result => result)
    )
}

Promise.all(categories.map(value => getDirData(value))).then(data => {
    let out = transformData(data)
    let filePath = path + 'gitExamples.json';
    try {
        fs.unlinkSync(filePath);
    } catch (e) {
    }
    fs.appendFile(filePath, (JSON.stringify(out)), function (err) {
        if (err) throw err;
        console.log('✅ -> Git examples was saved to ' + filePath);
    });

}).catch(error => console.log('❌ -> Git examples was failed: ' + error))


function transformData(data) {
    let out = {};
    for (let i in data) {
        for (let j in data[i]) {
            if (!out[data[i][j].dir]) out[data[i][j].dir] = []
            out[data[i][j].dir].push(data[i][j])
        }
    }
    return out
}