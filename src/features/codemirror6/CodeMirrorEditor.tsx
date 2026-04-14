import React, {
  useCallback,
  useMemo,
  forwardRef,
  useImperativeHandle,
  useRef,
} from "react";
import CodeMirror, { ReactCodeMirrorRef } from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import {
  autocompletion,
  CompletionContext,
  CompletionResult,
} from "@codemirror/autocomplete";
import { linter, Diagnostic } from "@codemirror/lint";
import { EditorView } from "@codemirror/view";
import { openSearchPanel } from "@codemirror/search";
import { GoogleGenAI } from "@google/genai";

interface CodeMirrorEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: "javascript" | "typescript";
  aiKey?: string | null;
}

export interface CodeMirrorEditorRef {
  openSearch: () => void;
  format: () => void;
  getSelection: () => string;
}

function createAiClient(aiKey: string | null | undefined) {
  const normalizedKey = aiKey?.trim();
  if (!normalizedKey) return null;
  return new GoogleGenAI({ apiKey: normalizedKey });
}

export const CodeMirrorEditor = forwardRef<
  CodeMirrorEditorRef,
  CodeMirrorEditorProps
>(({ value, onChange, language = "typescript", aiKey = null }, ref) => {
  const editorRef = useRef<ReactCodeMirrorRef>(null);

  useImperativeHandle(ref, () => ({
    openSearch: () => {
      if (editorRef.current?.view) {
        openSearchPanel(editorRef.current.view);
      }
    },
    format: () => {
      editorRef.current?.view?.focus();
    },
    getSelection: () => {
      if (editorRef.current?.view) {
        const state = editorRef.current.view.state;
        const selection = state.selection.main;
        if (!selection.empty) {
          return state.sliceDoc(selection.from, selection.to);
        }
      }
      return "";
    },
  }));

  const ai = useMemo(() => createAiClient(aiKey), [aiKey]);

  const aiCompletionSource = useCallback(
    async (context: CompletionContext): Promise<CompletionResult | null> => {
      const word = context.matchBefore(/\w*/);
      if (!word || (word.from === word.to && !context.explicit)) return null;

      if (!ai) return null;

      const doc = context.state.doc.toString();
      const pos = context.pos;
      const before = doc.slice(Math.max(0, pos - 500), pos);
      const after = doc.slice(pos, Math.min(doc.length, pos + 500));

      try {
        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: `You are an AI code completion assistant for ${language}.
Context before cursor:
\`\`\`${language}
${before}
\`\`\`
Context after cursor:
\`\`\`${language}
${after}
\`\`\`
Provide a list of 3-5 short, relevant code completions for the current position.
Completions should be what comes NEXT after the cursor.
Return ONLY a JSON array of strings.`,
          config: {
            responseMimeType: "application/json",
          },
        });

        let suggestions: string[] = [];
        try {
          suggestions = JSON.parse(response.text || "[]");
        } catch {
          console.error("Failed to parse AI suggestions.");
          return null;
        }

        return {
          from: word.from,
          options: suggestions.map((s: string) => ({
            label: s,
            displayLabel: s.length > 30 ? s.slice(0, 27) + "..." : s,
            type: "function",
            apply: (
              view: EditorView,
              completion: unknown,
              from: number,
              to: number,
            ) => {
              view.dispatch({
                changes: { from, to, insert: s },
                userEvent: "input.complete",
                effects: [EditorView.scrollIntoView(from + s.length)],
              });
            },
          })),
        };
      } catch (error) {
        console.error("AI Autocomplete Error:", error);
        return null;
      }
    },
    [ai, language],
  );

  const codeLinter = useMemo(
    () =>
      linter((view) => {
        const diagnostics: Diagnostic[] = [];
        const doc = view.state.doc.toString();

        const evalRegex = /\beval\s*\(/g;
        let match;
        while ((match = evalRegex.exec(doc)) !== null) {
          diagnostics.push({
            from: match.index,
            to: match.index + 4,
            severity: "warning",
            message: "Avoid using eval() for security reasons.",
          });
        }
        return diagnostics;
      }),
    [],
  );

  const extensions = useMemo(
    () => [
      javascript({ typescript: language === "typescript", jsx: true }),
      autocompletion({ override: [aiCompletionSource] }),
      codeLinter,
      EditorView.lineWrapping,
      EditorView.theme({
        "&": {
          height: "100%",
          fontSize: "16px",
          fontFamily: '"Atkinson Hyperlegible Mono", monospace',
          backgroundColor: "rgba(0, 0, 0, 0.7) !important",
        },
        ".cm-scroller": {
          overflow: "auto",
          paddingTop: "16px",
          fontFamily: '"Atkinson Hyperlegible Mono", monospace',
        },
        ".cm-content": {
          fontFamily: '"Atkinson Hyperlegible Mono", monospace',
        },
        ".cm-gutters": {
          backgroundColor: "rgba(0, 0, 0, 0.7) !important",
          borderRight: "1px solid rgba(20, 255, 236, 0.1)",
          color: "#14ffec",
        },
        ".cm-activeLine": {
          backgroundColor: "transparent !important",
        },
        ".cm-activeLineGutter": {
          backgroundColor: "rgba(20, 255, 236, 0.1) !important",
        },
      }),
    ],
    [language, aiCompletionSource, codeLinter],
  );

  return (
    <div className="h-full w-full codemirror-container">
      <CodeMirror
        ref={editorRef}
        value={value}
        height="100%"
        theme="dark"
        extensions={extensions}
        onChange={onChange}
        basicSetup={{
          lineNumbers: true,
          foldGutter: true,
          highlightActiveLine: false,
          dropCursor: true,
          allowMultipleSelections: true,
          indentOnInput: true,
          bracketMatching: true,
          closeBrackets: true,
          autocompletion: true,
          rectangularSelection: true,
          crosshairCursor: true,
          highlightSelectionMatches: true,
          tabSize: 2,
        }}
      />
      <style>{`
        .codemirror-container .cm-editor {
          outline: none !important;
        }
      `}</style>
    </div>
  );
});

CodeMirrorEditor.displayName = "CodeMirrorEditor";
