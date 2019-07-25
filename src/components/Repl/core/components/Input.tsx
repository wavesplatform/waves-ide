import * as React from 'react';
import { strsCommonPrefix } from '../utils';
import { TSchemaType } from '../../schemas/buildHelp';
// TODO import Autocomplete from './Autocomplete';
import keycodes from '../lib/keycodes';

import envFuncsSchema from '../../schemas/envFunctions.json';

export interface IInputProps {
    inputRef: any,
    onRun: any,
    autoFocus: any,
    readOnly: boolean,
    onClear: any,
    theme: string,
    history: Array<string>,
    addHistory: any,
    value?: string
}

export interface IInputState {
    value: string,
    multiline: boolean,
    rows: number,
    historyCursor: number,
    hideSuggest: boolean
}

export interface ISuggestRootProps {
    value?: string,
    commands?: string[],
    dropdown?: boolean,
    theme?: string
}

export interface ISuggestItemProps {
    title: string,
    selected?: boolean
}

export class Input extends React.Component<IInputProps, IInputState> {
    private input?: HTMLTextAreaElement | null;

    static commandsVocabulary: Record<string, TSchemaType> = (envFuncsSchema as any)
        .reduce((res: Record<string, TSchemaType>, el: TSchemaType) => ({...res, [el.name]: el}), {});

    static commandsList: Array<string> = [...(envFuncsSchema as any).map(({name}: TSchemaType) => name)];

    static commasAndQuotes: { [key: string]: string } = {
        '(': ')',
        '{': '}',
        '[': ']',
        '"': '"',
        "'": "'"
    };

    constructor(props: IInputProps) {
        super(props);

        // history is set in the componentDidMount
        this.state = {
            value: props.value || '',
            multiline: false,
            rows: 1,
            historyCursor: props.history.length,
            hideSuggest: false
        };

        // Bind some methods to instance
        this.onChange = this.onChange.bind(this);
        this.onKeyPress = this.onKeyPress.bind(this);
    }

    onChange() {
        if (!this.input) {
            return;
        }

        const {value} = this.input;
        const length = value.split('\n').length;

        this.setState({
            multiline: length > 1,
            rows: length < 20 ? length : 20,
            value,
        });
    }

    async onKeyPress(event: React.KeyboardEvent) {
        if (!this.input) {
            return;
        }


        const code = keycodes[event.keyCode];
        const {multiline} = this.state;
        const {history} = this.props;
        const command = this.input.value;

        // Clear console
        if (this.checkClearAction(event, code)) {
            return;
        }

        // Insert value from suggested commands
        if (this.checkShowSuggestAction(event, code)) {
            return;
        }

        // Insert closing bracket if needed
        this.checkAutoclosingAction(event);

        // Move in history if not in multiline mode
        if (!multiline && this.checkNotMultilineActions(event, code, this.input)) {
            return;
        }

        // Remove suggestions block if needed
        if (this.checkHideSuggestAction(event, code)) {
            return;
        }

        // Add command to history and try to execute it
        if (code === 'enter') {
            if (event.shiftKey) {
                return;
            }

            if (!command) {
                event.preventDefault();
                return;
            }

            this.props.addHistory(command);

            this.setState({historyCursor: history.length + 1, value: '', multiline: false});

            event.preventDefault();

            await this.props.onRun(command);

            // Don't use `this.input.scrollIntoView();` as it messes with iframes
            // window.scrollTo(0, document.body.scrollHeight);
            return;
        }
    }

    checkClearAction(event: React.KeyboardEvent, code: string): boolean {
        // Clear console
        if (event.ctrlKey && code === 'l') {
            this.props.onClear();
            return true;
        }

        return false;
    }

    checkShowSuggestAction(event: React.KeyboardEvent, code: string) {
        if (code === 'tab') {
            event.preventDefault();
            this.setCommandIntoInput();
            return true;
        }

        return false;
    }

    checkHideSuggestAction(event: React.KeyboardEvent, code: string): boolean {
        if (code === 'escape') {
            event.preventDefault();
            this.setState({hideSuggest: true});
            return true;
        } else {
            this.setState({hideSuggest: false});
        }

        return false;
    }

    checkAutoclosingAction(event: React.KeyboardEvent) {
        switch (event.key) {
            case '{':
            case '[':
            case '(':
                this.setClosingBracketIntoInput(event.key);
                break;
            case '}':
            case ']':
            case ')':
                this.setCaretAfterClosingBracket(event);
                break;
            case '"':
            case "'":
                this.setClosingQuoteOrSetCaretAfterClosingQuateIntoInput(event);
                break;
            case 'Backspace':
                this.unsetClosingBracketOrQuoteIntoInput();
                break;
        }
    }

    checkNotMultilineActions(event: React.KeyboardEvent, code: string, input: HTMLTextAreaElement): boolean {
        const {history} = this.props;
        let {historyCursor} = this.state;

        // Show back
        if (code === 'up arrow') {
            historyCursor--;

            let rows = history[historyCursor] ? history[historyCursor].split('\n') : [''];

            if (historyCursor < 0) {
                this.setState({historyCursor: 0});
                return true;
            }

            if (rows.length === 1 || (input.selectionStart <= rows[0].length && input.selectionEnd <= rows[0].length)) {
                this.setState(
                    {
                        historyCursor,
                        value: history[historyCursor]
                    },
                    () => {
                        input.setSelectionRange(rows[0].length, rows[0].length);
                    }
                );
            } else {
                return false;
            }

            event.preventDefault();

            return true;
        }

        // Move forward
        if (code === 'down arrow') {
            let len = history[historyCursor] ? history[historyCursor].length : 0;

            historyCursor++;

            if (historyCursor >= history.length && input.selectionStart === len && input.selectionEnd === len) {
                this.setState({historyCursor: history.length, value: ''});

                return true;
            }

            if (input.selectionStart === len && input.selectionEnd === len) {
                let len = history[historyCursor] ? history[historyCursor].length : 0;

                this.setState(
                    {
                        historyCursor,
                        value: history[historyCursor]
                    },
                    () => {
                        input.setSelectionRange(len, len);
                    }
                );
            } else {
                return false;
            }

            event.preventDefault();

            return true;
        }

        return false;
    }

    getCurrentCommandPiece(): string | undefined {
        let {input} = this;
        let pos: number = input ? input.selectionStart : 0;
        let commands: Array<string> = (input ? input.value.substring(0, pos) : '').split(/[\s+()]/);

        // Get last entry from string
        if (commands && commands.length) {
            return commands.pop();
        }

        return '';
    }

    setClosingBracketIntoInput(open: string = '(') {
        // No need to go further
        if (!this.input) {
            return;
        }

        let brackets = Input.commasAndQuotes;
        let {input} = this;
        let pos: number = input.selectionStart || 0;
        let close: string = brackets[open] ? brackets[open] : brackets['('];

        // Set new value
        input.value = input.value.substring(0, pos) +
            close +
            input.value.substring(pos);

        // Set new caret position
        this.setInputCaretPosition(pos);

        // Re-render to cleanup
        this.setInputValue(input.value);
    }

    setCaretAfterClosingBracket(event: React.KeyboardEvent) {
        let {input} = this;

        // No need to go further
        if (!input) {
            return;
        }


        let pos: number = input.selectionStart || 0;
        let open: string = input.value.substr(pos - 1, 1);
        let close: string = Input.commasAndQuotes[open];

        // Check if the closing symbol is similar to needed
        close = input.value.substr(pos, 1) === close ? close : '';

        // No need to go further
        if (!close) {
            return;
        }


        event.preventDefault();

        // Set new caret position
        this.setInputCaretPosition(pos + 1);

        // // Re-render to cleanup
        this.setInputValue(input.value);
    }

    setClosingQuoteOrSetCaretAfterClosingQuateIntoInput(event: React.KeyboardEvent) {
        let {input} = this;

        // No need to go further
        if (!input) {
            return;
        }


        let pos: number = input.selectionStart || 0;
        let open: string = input.value.substr(pos - 1, 1);
        let close: string = input.value.substr(pos, 1);

        let key = event.key;

        if (open === key && close === key) {
            event.preventDefault();

            this.setInputCaretPosition(pos + 1);

            // Re-render to cleanup
            this.setInputValue(input.value);

        } else {
            input.value = input.value.substring(0, pos) +
                key +
                input.value.substring(pos);

            // Set new caret position
            this.setInputCaretPosition(pos);

            // // Re-render to cleanup
            this.setInputValue(input.value);
        }
    }

    unsetClosingBracketOrQuoteIntoInput() {
        // No need to go further
        if (!this.input) {
            return;
        }

        let {input} = this;
        let pos: number = input.selectionStart || 0;

        // No need to go further
        if (pos === 0) {
            return;
        }

        let open: string = this.input.value.substr(pos - 1, 1);
        let close: string = Input.commasAndQuotes[open];

        // No need to go further
        if (!close) {
            return;
        }

        // Check if the closing symbol is similar to needed
        close = this.input.value.substr(pos, 1) === close ? close : '';

        // No need to go further
        if (!close) {
            return;
        }

        // Set new value
        input.value = input.value.substring(0, pos) +
            input.value.substring(pos + 1);

        // Set new caret position
        this.setInputCaretPosition(pos);

        // Re-render to cleanup
        this.setInputValue(input.value);
    }

    setCommandIntoInput() {
        // No need to go further
        if (!this.input) {
            return;
        }


        let {input} = this;
        let beg: number = input.selectionStart || 0;
        let end: number = input.selectionEnd || 0;
        let pos: number = beg;
        let insert = this.getCurrentCommandPiece();
        let missing: string | undefined = '';

        let commands: Array<string> = this.getFilteredCommandsList();

        if (insert === undefined) {
            return;
        }



        // If only one command
        if (commands.length === 1) {
            let isFunc: boolean = false;
            let command: string | undefined = '';
            let vocabulary = Input.commandsVocabulary;

            // Get command
            command = commands[0];

            // No need to go further
            if (command === undefined) {
                return;
            }

            // Check if it's method or member
            isFunc = vocabulary[command] && vocabulary[command].args !== undefined;

            // Get missing part of command name
            missing = command.substring(insert.length);

            // Set new value
            input.value = input.value.substring(0, beg) +
                missing + (isFunc ? '()' : '') +
                input.value.substring(end);

            // Set new caret position
            pos += missing.length;
            pos += isFunc ? 1 : 0;

            this.setInputCaretPosition(pos);

            // Re-render to cleanup
            this.setInputValue(input.value);
        } else {
            // If several commands

            // Get missing part of command name
            let commandsCommonPrefix = strsCommonPrefix(commands);

            missing = commandsCommonPrefix.substring(insert.length);

            // Set new value
            input.value = input.value.substring(0, beg) +
                missing +
                input.value.substring(end);

            // Set new caret position
            pos += missing.length;

            this.setInputCaretPosition(pos);

            // Re-render to cleanup
            this.setInputValue(input.value);
        }

    }

    setInputCaretPosition(position: number): void {
        if (!this.input) {
            return;
        }


        let {input} = this;

        input.selectionStart = position;
        input.selectionEnd = position;
    }

    setInputValue(value: string): void {
        this.setState({value});
    }

    getFilteredCommandsList(): Array<string> {
        let seek: any = this.getCurrentCommandPiece();
        let list: Array<string> = [];

        if (seek) {
            // Get filtered list if possible
            list = Input.commandsList.filter((item: string) => {
                return item.indexOf(seek) === 0;
            });

            // Check for values inside
            if (list.length) {
                return list;
            }
        }

        return [];
    }

    render() {
        const rect = this.input ? this.input.getBoundingClientRect() : null;
        const dropdown = rect != null && rect.top < 50;
        const suggest = !this.state.hideSuggest ? this.createSuggest(dropdown) : null;
        const textarea = this.createTextarea();

        return (
            <div className="Input">
                {suggest}
                {textarea}
            </div>
        );
    }

    createSuggest(dropdown: boolean) {
        const {value} = this.state;
        const {theme} = this.props;
        const commands = this.getFilteredCommandsList();

        return (<SuggestRoot
            value={value}
            commands={commands}
            dropdown={dropdown}
            theme={theme}
        />);
    }

    createTextarea() {
        const {autoFocus, readOnly} = this.props;
        const {rows, value} = this.state;

        return (
            <textarea
                readOnly={readOnly}
                className="cli"
                rows={rows}
                autoFocus={autoFocus}
                ref={e => {
                    this.input = e;
                    this.props.inputRef(e);
                }}
                value={value}
                onChange={this.onChange}
                onKeyDown={this.onKeyPress}
            />
        );
    }

}

function SuggestRoot(props: ISuggestRootProps) {
    const {value, theme, commands} = props;

    // No need to go further
    if (!commands || !commands.length || !value) {
        return null;
    }

    return (
        <div className={'Suggest' + (theme ? ' Suggest_theme_' + theme : '')}>
            <SuggestList {...props} />
            &nbsp;
        </div>
    );
}

function SuggestList(props: ISuggestRootProps) {
    // No need to go further
    if (!props.commands || !props.commands.length) {
        return null;
    }

    const commands = props.commands.map((item: string, index: number) => {
        return (<SuggestItem
            key={'commands-suggest-item-' + index}
            title={item}
        />);
    });

    return (
        <ul className={'Suggest__list' + (props.dropdown ? ' Suggest__list_drop_down' : '')}>
            {commands}
        </ul>
    );
}

function SuggestItem(props: ISuggestItemProps) {
    return (<li
        className={'Suggest__item' + (props.selected ? ' Suggest__item_is_selected' : '')}
    >
        {props.title}
    </li>);
}
