import React from 'react';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';
import { EditorState } from '@codemirror/state';
import { EditorView, keymap, lineNumbers, highlightActiveLineGutter, highlightSpecialChars, drawSelection, dropCursor, rectangularSelection, crosshairCursor, highlightActiveLine } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { bracketMatching, foldGutter, foldKeymap, indentOnInput } from '@codemirror/language';
import { searchKeymap, highlightSelectionMatches } from '@codemirror/search';
import { autocompletion, completionKeymap, closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete';
import { lintKeymap } from '@codemirror/lint';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark'; // We can customize this for light theme
import { useEffect, useRef } from 'react';

const CodeMirrorEditor = ({ fileData, fileName, codeChange }) => {
    const editorRef = useRef();
    const viewRef = useRef();

    useEffect(() => {
        const startState = EditorState.create({
            doc: fileData || '',
            extensions: [
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
                javascript(),
                EditorView.updateListener.of((update) => {
                    if (update.docChanged) {
                        codeChange(update.state.doc.toString());
                    }
                }),
                EditorView.theme({
                    "&": {
                        height: "100%",
                        fontSize: "14px"
                    },
                    ".cm-content": {
                        fontFamily: "Menlo, Monaco, 'Courier New', monospace"
                    }
                })
            ]
        });

        const view = new EditorView({
            state: startState,
            parent: editorRef.current
        });

        viewRef.current = view;

        return () => {
            view.destroy();
        };
    }, []);

    useEffect(() => {
        if (viewRef.current && fileData !== viewRef.current.state.doc.toString()) {
            viewRef.current.dispatch({
                changes: { from: 0, to: viewRef.current.state.doc.length, insert: fileData || '' }
            });
        }
    }, [fileData]);

    return <div ref={editorRef} style={{ height: '100%', width: '100%' }} />;
};

export default CodeMirrorEditor;
