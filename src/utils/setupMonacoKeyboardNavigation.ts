import type * as monaco from 'monaco-editor/esm/vs/editor/editor.api';

const SUGGEST_WIDGET_IS_NOT_OPEN = '!suggestWidgetVisible';

export const setupMonacoKeyboardNavigation = (
    editor: monaco.editor.IStandaloneCodeEditor,
    m: typeof monaco,
    options: { enter?: boolean, enterInSuggestWidget?: boolean } = {}
) => {
    editor.addCommand(m.KeyCode.UpArrow, () => {
        editor.trigger('keyboard', 'cursorUp', {});
    }, SUGGEST_WIDGET_IS_NOT_OPEN);

    editor.addCommand(m.KeyCode.DownArrow, () => {
        editor.trigger('keyboard', 'cursorDown', {});
    }, SUGGEST_WIDGET_IS_NOT_OPEN);

    editor.addCommand(m.KeyMod.Shift | m.KeyCode.UpArrow, () => {
        editor.trigger('keyboard', 'cursorUpSelect', {});
    }, SUGGEST_WIDGET_IS_NOT_OPEN);

    editor.addCommand(m.KeyMod.Shift | m.KeyCode.DownArrow, () => {
        editor.trigger('keyboard', 'cursorDownSelect', {});
    }, SUGGEST_WIDGET_IS_NOT_OPEN);

    if (options.enter) {
        editor.addCommand(m.KeyCode.Enter, () => {
            editor.trigger('keyboard', 'type', { text: '\n' });
        }, options.enterInSuggestWidget ? undefined : SUGGEST_WIDGET_IS_NOT_OPEN);
    }
};
