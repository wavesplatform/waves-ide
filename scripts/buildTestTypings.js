const fs = require('fs');

const outPath = 'src/testTypings.json';

const files = [
    'node_modules/@waves/waves-transactions/dist/transactions.d.ts',
    'node_modules/@waves/js-test-env/index.d.ts',
    'node_modules/@types/mocha/index.d.ts',
    'node_modules/@types/chai/index.d.ts'
];

const ignore = [
    {search: 'export', replace: ''},
    {search: 'import', replace: '//import'},
    {
        search: "declare enum DATA_FIELD_TYPE {\n    INTEGER = \"integer\",\n    BOOLEAN = \"boolean\",\n    BINARY = \"binary\",\n    STRING = \"string\"\n}",
        replace: ''
    },
];

const out = files.map(path => {
    if (fs.existsSync(path)) {
        const text = fs.readFileSync(path, 'utf8');
        console.log(`${path} was read successfully`);
        return path.includes('js-test-env') || path.includes('waves-transactions')
            ? ((out) => {
                ignore.forEach(item => out = out.replace(new RegExp(item.search, 'gm'), item.replace));
                return out
            })(text)
            : text
    } else {
        console.error(`${path} not found`);
    }

});

out.push('declare function expect(target: any, message?: string): chai.Assertion = chai.expect(target, message)');

if (fs.existsSync(outPath)) {
    fs.unlinkSync(outPath);
}
fs.appendFileSync(outPath, JSON.stringify(out, null, 4));

console.log('✅ -> typings were saved to ' + outPath);

