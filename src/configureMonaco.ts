export default function configureMonaco(){
    // Since packaging is done by you, you need
// to instruct the editor how you named the
// bundles that contain the web workers.
    (self as any).MonacoEnvironment = {
        getWorkerUrl: function (moduleId: any, label: any) {
            if (label === 'json') {
                return './json.worker.bundle.js';
            }
            if (label === 'css') {
                return './css.worker.bundle.js';
            }
            if (label === 'html') {
                return './html.worker.bundle.js';
            }
            if (label === 'typescript' || label === 'javascript') {
                return './ts.worker.bundle.js';
            }
            return './editor.worker.bundle.js';
        }
    }
}
