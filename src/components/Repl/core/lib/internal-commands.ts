interface IResp {
    value: string,
    html: boolean
}
const welcome: () => IResp = () => ({
    value: `Waves console 2.1  Docs can be found <a target="_blank" href="https://github.com/wavesplatform/waves-repl/blob/master/README.md">here</a>
Use <strong>help()</strong> to show commands. `,
    html: true,
});

const history = async ({app, args: [n = null]}:any) => {
    const history = app.context.store.getState().history;
    if (n === null) {
        return history.map((item:any, i:number) => `${i}: ${item.trim()}`).join('\n');
    }

    // try to re-issue the historical command
    const command = history.find((item:any, i:number) => i === n);
    if (command) {
        app.onRun(command);
    }

    return;
};

const clear = ({console}:any) => {
    console.clear();
};


const commands: any = {
    welcome,
    clear,
    history
};

export default commands;
