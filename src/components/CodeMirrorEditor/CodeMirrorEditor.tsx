import 'xterm/css/xterm.css';
import { EditorState, Compartment } from '@codemirror/state';
import { EditorView, keymap, lineNumbers, highlightActiveLineGutter, highlightSpecialChars, drawSelection, dropCursor, rectangularSelection, crosshairCursor, highlightActiveLine } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { bracketMatching, foldGutter, foldKeymap, indentOnInput } from '@codemirror/language';
import { searchKeymap, highlightSelectionMatches } from '@codemirror/search';
import { autocompletion, completionKeymap, closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete';
import { lintKeymap } from '@codemirror/lint';
import { useEffect, useRef } from 'react';
import "./CodeMirror.scss"
import { githubLight } from '@fsegurai/codemirror-theme-github-light';

import { cpp } from '@codemirror/lang-cpp';
import { css } from '@codemirror/lang-css';
import { go } from '@codemirror/lang-go';
import { html } from '@codemirror/lang-html';
import { java } from '@codemirror/lang-java';
import { javascript } from '@codemirror/lang-javascript';
import { json } from '@codemirror/lang-json';
import { markdown } from '@codemirror/lang-markdown';
import { php } from '@codemirror/lang-php';
import { python } from '@codemirror/lang-python';
import { rust } from '@codemirror/lang-rust';
import { sql } from '@codemirror/lang-sql';
import { xml } from '@codemirror/lang-xml';
import { yaml } from '@codemirror/lang-yaml';


const languageCompartment = new Compartment();

const getLanguageExtension = (fileName: string) => {
    if (!fileName) return [];

    const extension = fileName.split('.').pop()?.toLowerCase();

    switch (extension) {
        case 'c':
        case 'cpp':
        case 'h':
        case 'cc':
            return cpp();
        case 'css':
        case 'scss':
        case 'less':
            return css();
        case 'go':
            return go();
        case 'html':
        case 'htm':
            return html();
        case 'java':
            return java();
        case 'js':
        case 'jsx':
        case 'mjs':
        case 'cjs':
            return javascript({ jsx: true });
        case 'ts':
        case 'tsx':
            return javascript({ typescript: true, jsx: true });
        case 'json':
            return json();
        case 'md':
        case 'markdown':
            return markdown();
        case 'php':
            return php();
        case 'py':
            return python();
        case 'rs':
            return rust();
        case 'sql':
            return sql();
        case 'xml':
        case 'svg':
            return xml();
        case 'yaml':
        case 'yml':
            return yaml();
        default:
            return [];
    }
};

interface CodeMirrorEditorProps {
    fileData: string;
    fileName: string;
    codeChange: (value: string) => void;
}

const CodeMirrorEditor: React.FC<CodeMirrorEditorProps> = ({ fileData, fileName, codeChange }) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const viewRef = useRef<EditorView | null>(null);

    useEffect(() => {
        if (!editorRef.current) return;

        const state = EditorState.create({
            doc: fileData || '',
            extensions: [
                // Add the GitHub light theme here
                githubLight,

                lineNumbers(),
                highlightActiveLineGutter(),
                highlightSpecialChars(),
                history(),
                foldGutter(),
                drawSelection(),
                dropCursor(),
                EditorState.allowMultipleSelections.of(true),
                indentOnInput(),
                bracketMatching(),
                closeBrackets(),
                autocompletion(),
                rectangularSelection(),
                crosshairCursor(),
                highlightActiveLine(),
                highlightSelectionMatches(),

                keymap.of([
                    ...closeBracketsKeymap,
                    ...defaultKeymap,
                    ...searchKeymap,
                    ...historyKeymap,
                    ...foldKeymap,
                    ...completionKeymap,
                    ...lintKeymap
                ]),

                languageCompartment.of(
                    getLanguageExtension(fileName)
                ),

                EditorView.updateListener.of((update) => {
                    if (update.docChanged) {
                        codeChange(update.state.doc.toString());
                    }
                })
            ]
        });

        const view = new EditorView({
            state,
            parent: editorRef.current
        });

        viewRef.current = view;
        return () => view.destroy();
    }, []);

    /* Update content */
    useEffect(() => {
        if (!viewRef.current) return;

        const current = viewRef.current.state.doc.toString();
        if (fileData !== current) {
            viewRef.current.dispatch({
                changes: { from: 0, to: current.length, insert: fileData || '' }
            });
        }
    }, [fileData]);

    /* Update language */
    useEffect(() => {
        if (!viewRef.current) return;

        viewRef.current.dispatch({
            effects: languageCompartment.reconfigure(
                getLanguageExtension(fileName)
            )
        });
    }, [fileName]);

    return <div ref={editorRef} style={{ height: '100%', width: '100%' }} />;
};

export default CodeMirrorEditor;