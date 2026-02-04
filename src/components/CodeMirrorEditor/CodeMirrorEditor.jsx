import 'xterm/css/xterm.css';
import { useEffect, useRef } from 'react';
import "./CodeMirror.scss"
/* Core */
import {
    EditorState,
    Compartment
} from '@codemirror/state';

import {
    EditorView,
    keymap,
    lineNumbers,
    highlightActiveLineGutter,
    highlightSpecialChars,
    drawSelection,
    dropCursor,
    rectangularSelection,
    crosshairCursor,
    highlightActiveLine
} from '@codemirror/view';

/* Theme */
import { githubLight } from '@fsegurai/codemirror-theme-github-light'; // Updated import

/* Commands */
import {
    defaultKeymap,
    history,
    historyKeymap
} from '@codemirror/commands';

/* Language helpers */
import {
    bracketMatching,
    foldGutter,
    foldKeymap,
    indentOnInput
} from '@codemirror/language';

/* Search */
import {
    searchKeymap,
    highlightSelectionMatches
} from '@codemirror/search';

/* Autocomplete */
import {
    autocompletion,
    completionKeymap,
    closeBrackets,
    closeBracketsKeymap
} from '@codemirror/autocomplete';

import { lintKeymap } from '@codemirror/lint';

/* Languages */
import { javascript } from '@codemirror/lang-javascript';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { php } from '@codemirror/lang-php';
import { json } from '@codemirror/lang-json';
import { python } from '@codemirror/lang-python';
import { java } from '@codemirror/lang-java';
import { cpp } from '@codemirror/lang-cpp';
import { rust } from '@codemirror/lang-rust';
import { go } from '@codemirror/lang-go';
import { sql } from '@codemirror/lang-sql';
import { xml } from '@codemirror/lang-xml';
import { markdown } from '@codemirror/lang-markdown';
import { yaml } from '@codemirror/lang-yaml';

/* ---------- Compartments ---------- */
const languageCompartment = new Compartment();

/* ---------- Language Resolver ---------- */
const getLanguageExtension = (fileName = '') => {
    const ext = fileName.split('.').pop().toLowerCase();

    switch (ext) {
        case 'js':
        case 'jsx':
        case 'ts':
        case 'tsx':
            return javascript({ jsx: true, typescript: true });

        case 'html':
        case 'htm':
            return html();

        case 'css':
        case 'scss':
        case 'less':
            return css();

        case 'php':
            return php({ baseLanguage: html() });

        case 'json':
            return json();

        case 'py':
            return python();

        case 'java':
            return java();

        case 'c':
        case 'cpp':
        case 'h':
        case 'hpp':
            return cpp();

        case 'rs':
            return rust();

        case 'go':
            return go();

        case 'sql':
            return sql();

        case 'xml':
            return xml();

        case 'md':
            return markdown();

        case 'yml':
        case 'yaml':
            return yaml();

        default:
            return javascript();
    }
};

/* ---------- Editor Component ---------- */
const CodeMirrorEditor = ({ fileData, fileName, codeChange }) => {
    const editorRef = useRef(null);
    const viewRef = useRef(null);

    useEffect(() => {
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