const fs = require('fs');
const outPath = 'src/json-data/test-typings.json';
const files = [
    'node_modules/typescript/lib/lib.es5.d.ts',
    'node_modules/typescript/lib/lib.es6.d.ts',
    'node_modules/typescript/lib/lib.es2015.d.ts',
    'node_modules/typescript/lib/lib.es2015.collection.d.ts',
    'node_modules/typescript/lib/lib.es2015.promise.d.ts',
    'node_modules/@waves/js-test-env/index.d.ts',
    'node_modules/@waves/waves-transactions/dist/transactions.d.ts',
    'node_modules/@types/mocha/index.d.ts',
    'node_modules/@types/chai/index.d.ts',
    'node_modules/@types/chai-as-promised/index.d.ts',
    'node_modules/@waves/waveskeeper-types/globals.d.ts'
];

const ignore = [
    {search: 'export', replace: ''},
    {search: 'import', replace: '//import'},
    {search: 'expect', replace: '//'},
    {search: 'declare global', replace: ''},
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

}).filter(lib => lib != null);

out.push('const expect = chai.expect');
out.push('interface Console {\nmemory: any;\nassert(condition?: boolean, message?: string, ...data: any[]): void;\nclear(): void;\ncount(label?: string): void;\ndebug(message?: any, ...optionalParams: any[]): void;\ndir(value?: any, ...optionalParams: any[]): void;\ndirxml(value: any): void;\nerror(message?: any, ...optionalParams: any[]): void;\nexception(message?: string, ...optionalParams: any[]): void;\ngroup(groupTitle?: string, ...optionalParams: any[]): void;\ngroupCollapsed(groupTitle?: string, ...optionalParams: any[]): void;\ngroupEnd(): void;\ninfo(message?: any, ...optionalParams: any[]): void;\nlog(message?: any, ...optionalParams: any[]): void;\nmarkTimeline(label?: string): void;\nprofile(reportName?: string): void;\nprofileEnd(reportName?: string): void;\ntable(...tabularData: any[]): void;\ntime(label?: string): void;\ntimeEnd(label?: string): void;\ntimeStamp(label?: string): void;\ntimeline(label?: string): void;\ntimelineEnd(label?: string): void;\ntrace(message?: any, ...optionalParams: any[]): void;\nwarn(message?: any, ...optionalParams: any[]): void;\n}\n\ndeclare var console: Console;');
out.push('declare function setInterval(handler: TimerHandler, timeout?: number, ...arguments: any[]): number;\ndeclare function setTimeout(handler: TimerHandler, timeout?: number, ...arguments: any[]): number;');
if (fs.existsSync(outPath)) {
    fs.unlinkSync(outPath);
}
fs.appendFileSync(outPath, JSON.stringify(out.join('\n'), null, 4));

console.log('✅ -> typings were saved to ' + outPath);

