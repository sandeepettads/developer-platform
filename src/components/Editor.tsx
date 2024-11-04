import React, { useEffect } from 'react';
import MonacoEditor from '@monaco-editor/react';
import { useFileStore } from '../store/useFileStore';
import { editor } from 'monaco-editor';

const EDITOR_THEME_NAME = 'webideTheme';

export const Editor: React.FC = () => {
  const { activeFile } = useFileStore();
  
  useEffect(() => {
    // Define custom theme
    editor.defineTheme(EDITOR_THEME_NAME, {
      base: 'vs-dark',
      inherit: true,
      rules: [
        // TypeScript/JavaScript
        { token: 'keyword', foreground: 'C678DD' },  // import, export, const, etc
        { token: 'string', foreground: '98C379' },   // string literals
        { token: 'identifier', foreground: 'E06C75' }, // variable names
        { token: 'type', foreground: '61AFEF' },     // types
        { token: 'interface', foreground: '61AFEF' }, // interface keyword
        { token: 'number', foreground: 'D19A66' },   // numeric literals
        { token: 'comment', foreground: '5C6370' },  // comments
        
        // Python
        { token: 'def', foreground: '61AFEF' },      // function definitions
        { token: 'class', foreground: '61AFEF' },    // class definitions
        { token: 'self', foreground: 'E06C75' },     // self keyword
        { token: 'builtin', foreground: '56B6C2' },  // built-in functions
        
        // HTML/JSX
        { token: 'tag', foreground: 'E06C75' },      // HTML/JSX tags
        { token: 'attribute.name', foreground: 'D19A66' }, // attribute names
        { token: 'attribute.value', foreground: '98C379' }, // attribute values
        
        // CSS
        { token: 'property', foreground: '56B6C2' }, // CSS properties
        { token: 'value', foreground: '98C379' },    // CSS values
        
        // Common
        { token: 'function', foreground: '61AFEF' }, // function calls
        { token: 'variable', foreground: 'ABB2BF' }, // variables
        { token: 'operator', foreground: '56B6C2' }, // operators
        { token: 'punctuation', foreground: 'ABB2BF' }, // punctuation
      ],
      colors: {
        'editor.background': '#21252B',
        'editor.foreground': '#ABB2BF',
        'editor.lineHighlightBackground': '#2C313A',
        'editor.selectionBackground': '#3E4451',
        'editor.inactiveSelectionBackground': '#3E4451',
        'editorCursor.foreground': '#528BFF',
        'editorWhitespace.foreground': '#3B4048',
        'editorIndentGuide.background': '#3B4048',
        'editorLineNumber.foreground': '#495162',
        'editorLineNumber.activeForeground': '#6B717D',
        'editor.findMatchBackground': '#42557B',
        'editor.findMatchHighlightBackground': '#314365',
        'editorOverviewRuler.border': '#21252B',
        'editorGutter.background': '#21252B',
        'editorWidget.background': '#21252B',
        'editorSuggestWidget.background': '#21252B',
        'editorSuggestWidget.border': '#181A1F',
        'editorSuggestWidget.selectedBackground': '#2C313A',
        'list.hoverBackground': '#2C313A',
        'list.activeSelectionBackground': '#2C313A',
      }
    });

    // Set as default theme
    editor.setTheme(EDITOR_THEME_NAME);
  }, []);

  if (!activeFile) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500 bg-[#21252B]">
        Select a file to start editing
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-[#21252B]">
      <MonacoEditor
        height="100%"
        defaultLanguage={activeFile.language || 'plaintext'}
        value={activeFile.content}
        onChange={(value) => {
          if (value !== undefined) {
            useFileStore.getState().updateFile({
              ...activeFile,
              content: value
            });
          }
        }}
        theme={EDITOR_THEME_NAME}
        beforeMount={(monaco) => {
          monaco.editor.setTheme(EDITOR_THEME_NAME);
        }}
        options={{
          minimap: { enabled: true },
          fontSize: 14,
          wordWrap: 'on',
          automaticLayout: true,
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          folding: true,
          renderLineHighlight: 'all',
          fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, 'Courier New', monospace",
          fontLigatures: true,
          bracketPairColorization: {
            enabled: true,
          },
          guides: {
            bracketPairs: true,
            indentation: true,
          },
          cursorBlinking: 'smooth',
          cursorSmoothCaretAnimation: true,
          smoothScrolling: true,
          padding: {
            top: 8,
            bottom: 8,
          },
          theme: EDITOR_THEME_NAME,
        }}
      />
    </div>
  );
};