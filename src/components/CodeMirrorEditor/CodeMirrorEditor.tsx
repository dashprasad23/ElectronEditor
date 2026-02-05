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
import { githubDark } from '@fsegurai/codemirror-theme-github-dark';

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
import { useSelector } from 'react-redux';
import { RootState } from '../../store';


const languageCompartment = new Compartment();
const themeCompartment = new Compartment();

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
    const { theme } = useSelector((state: RootState) => state.settings);

    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);

    const codeChangeRef = useRef(codeChange);

    useEffect(() => {
        codeChangeRef.current = codeChange;
    }, [codeChange]);

    useEffect(() => {
        if (!editorRef.current) return;

        // Custom override to match app theme #1e1e1e
        const customDarkTheme = EditorView.theme({
            "&": {
                backgroundColor: "#1e1e1e !important",
                color: "#c9d1d9"
            },
            ".cm-gutters": {
                backgroundColor: "#1e1e1e !important",
                color: "#8b949e",
                borderRight: "1px solid #30363d"
            },
            ".cm-activeLine": {
                backgroundColor: "#2b2b2b !important"
            },
            ".cm-activeLineGutter": {
                backgroundColor: "#2b2b2b !important",
                color: "#e6edf3"
            }
        }, { dark: true });

        const state = EditorState.create({
            doc: fileData || '',
            extensions: [
                themeCompartment.of([
                    isDark ? githubDark : githubLight,
                    isDark ? customDarkTheme : []
                ]),

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
                        codeChangeRef.current(update.state.doc.toString());
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
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

    /* Update theme */
    useEffect(() => {
        if (!viewRef.current) return;

        const customDarkTheme = EditorView.theme({
            "&": {
                backgroundColor: "#1e1e1e !important",
                color: "#c9d1d9"
            },
            ".cm-gutters": {
                backgroundColor: "#1e1e1e !important",
                color: "#8b949e",
                borderRight: "1px solid #30363d"
            },
            ".cm-activeLine": {
                backgroundColor: "#2b2b2b !important"
            },
            ".cm-activeLineGutter": {
                backgroundColor: "#2b2b2b !important",
                color: "#e6edf3"
            }
        }, { dark: true });

        viewRef.current.dispatch({
            effects: themeCompartment.reconfigure([
                isDark ? githubDark : githubLight,
                isDark ? customDarkTheme : []
            ])
        });
    }, [isDark]);

    return <div ref={editorRef} style={{ height: '100%', width: '100%' }} />;
};

export default CodeMirrorEditor;