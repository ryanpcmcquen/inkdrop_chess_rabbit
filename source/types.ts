const CodeMirror = require("codemirror");

export interface Editor {
    cm: CodeMirror.Editor;
    forceUpdate(): any;
    wrapper: any;
}

export interface Inkdrop {
    window: any;
    commands: any;
    config: any;
    components: any;
    layouts: any;
    store: any;
    getActiveEditor(): Editor;
    onEditorLoad(callback: (e: Editor) => void): void;
    isEditorActive(): boolean;
}
