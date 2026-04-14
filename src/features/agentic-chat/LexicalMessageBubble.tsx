import React, { useState, useEffect } from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';
import { TRANSFORMERS, $convertFromMarkdownString, $convertToMarkdownString, ElementTransformer } from '@lexical/markdown';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { ListNode, ListItemNode } from '@lexical/list';
import { CodeNode } from '@lexical/code';
import { LinkNode } from '@lexical/link';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { CodeMirrorNode, $createCodeMirrorNode, $isCodeMirrorNode } from './CodeMirrorNode';

interface LexicalMessageBubbleProps {
  initialContent: string;
  role: 'user' | 'assistant';
  isEditable?: boolean;
  onContentChange?: (newContent: string) => void;
}

// Custom Markdown Transformer for CodeMirrorNode
export const CODE_MIRROR_TRANSFORMER: ElementTransformer = {
  dependencies: [CodeMirrorNode],
  export: (node) => {
    if (!$isCodeMirrorNode(node)) {
      return null;
    }
    const codeContent = node.__code;
    const language = node.__language;
    return `\`\`\`${language}\n${codeContent}\n\`\`\``;
  },
  regExp: /```([a-z0-9]+)?\n([\s\S]*?)```/i,
  replace: (parentNode, children, match, isImport) => {
    const language = match[1] || 'text';
    const code = match[2];
    const codeNode = $createCodeMirrorNode(code, language);
    parentNode.replace(codeNode);
  },
  type: 'element',
};

// Replace the default CODE transformer with our custom one
const CUSTOM_TRANSFORMERS = [
  CODE_MIRROR_TRANSFORMER,
  ...TRANSFORMERS.filter((t) => t.type !== 'element' || t.export?.name !== 'CodeNode'),
];

function MarkdownUpdater({ content, isEditable }: { content: string, isEditable: boolean }) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    editor.setEditable(isEditable);
  }, [editor, isEditable]);

  useEffect(() => {
    if (!isEditable) {
      editor.update(() => {
        $convertFromMarkdownString(content, CUSTOM_TRANSFORMERS);
      });
    }
  }, [content, editor, isEditable]);

  return null;
}

function OnChangePlugin({ onChange }: { onChange: (markdown: string) => void }) {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const markdown = $convertToMarkdownString(CUSTOM_TRANSFORMERS);
        onChange(markdown);
      });
    });
  }, [editor, onChange]);
  return null;
}

export function LexicalMessageBubble({ initialContent, role, isEditable = false, onContentChange }: LexicalMessageBubbleProps) {
  const [isEditing, setIsEditing] = useState(isEditable);
  const [content, setContent] = useState(initialContent);

  useEffect(() => {
    if (!isEditing) {
      setContent(initialContent);
    }
  }, [initialContent, isEditing]);

  const initialConfig = {
    namespace: 'AgenticChatBubble',
    theme: {
      paragraph: 'mb-2',
      text: {
        bold: 'font-bold',
        italic: 'italic',
        underline: 'underline',
        strikethrough: 'line-through',
      },
      list: {
        ul: 'list-disc ml-4 mb-2',
        ol: 'list-decimal ml-4 mb-2',
        listitem: 'mb-1',
      },
      heading: {
        h1: 'text-xl font-bold mb-2',
        h2: 'text-lg font-bold mb-2',
        h3: 'text-md font-bold mb-2',
      },
      quote: 'border-l-4 border-gray-500 pl-4 italic mb-2',
    },
    nodes: [
      HeadingNode,
      QuoteNode,
      ListNode,
      ListItemNode,
      CodeMirrorNode,
      CodeNode,
      LinkNode,
    ],
    onError: (error: Error) => {
      console.error('Lexical Error:', error);
    },
    editorState: () => {
      $convertFromMarkdownString(initialContent, CUSTOM_TRANSFORMERS);
    }
  };

  return (
    <div className={`relative group w-full`}>
      <LexicalComposer initialConfig={initialConfig}>
        <div className={`relative ${isEditing ? 'ring-1 ring-brand-primary rounded p-1' : ''}`}>
          <RichTextPlugin
            contentEditable={<ContentEditable className="outline-none min-h-[1.5em]" />}
            placeholder={<div className="absolute top-0 left-0 opacity-50 pointer-events-none">Empty message...</div>}
            ErrorBoundary={LexicalErrorBoundary}
          />
          <HistoryPlugin />
          <MarkdownShortcutPlugin transformers={CUSTOM_TRANSFORMERS} />
          <MarkdownUpdater content={content} isEditable={isEditing} />
          {isEditing && onContentChange && (
            <OnChangePlugin onChange={onContentChange} />
          )}
        </div>
      </LexicalComposer>

      {/* Edit Toggle Button */}
      {role === 'assistant' && (
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="absolute -top-6 right-0 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 text-white text-xs px-2 py-1 rounded border border-glass-border hover:bg-brand-primary hover:text-black"
        >
          {isEditing ? 'Done' : 'Edit'}
        </button>
      )}
    </div>
  );
}
