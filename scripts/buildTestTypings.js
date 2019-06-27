const fs = require('fs');

const outPath = 'src/testTypings.json';

const files = [
    'node_modules/@waves/waves-transactions/dist/transactions.d.ts',
    'node_modules/@waves/js-test-env/index.d.ts',
    'node_modules/@types/mocha/index.d.ts',
    'node_modules/@types/chai/index.d.ts'
];

const out = files.map(path => {
    if (fs.existsSync(path)) {
        const text = fs.readFileSync(path, 'utf8');
        console.log(`${path} was read successfully`);
        return path.includes('js-test-env') || path.includes('waves-transactions')
            ? text
                .replace(/export/gm, '')
                .replace(/import/gm, '//import')
            : text
    } else {
        console.error(`${path} not found`);
    }
});

if (fs.existsSync(outPath)) {
    fs.unlinkSync(outPath);
}
fs.appendFileSync(outPath, JSON.stringify(out, null, 4));

console.log('✅ -> typings were saved to ' + outPath);

