import React, { useState } from 'react';
import { DecoratorNode, DOMConversionMap, DOMExportOutput, LexicalNode, NodeKey, SerializedLexicalNode, Spread } from 'lexical';
import { CodeMirrorEditor } from '../codemirror6/CodeMirrorEditor';
import { Copy, Check } from 'lucide-react';

export type SerializedCodeMirrorNode = Spread<
  {
    code: string;
    language: string;
  },
  SerializedLexicalNode
>;

function CodeMirrorComponent({
  nodeKey,
  initialCode,
  language,
}: {
  nodeKey: NodeKey;
  initialCode: string;
  language: string;
}) {
  const [code, setCode] = useState(initialCode);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative my-4 rounded-md overflow-hidden border border-glass-border bg-black/40">
      <div className="flex items-center justify-between px-4 py-1 bg-black/60 border-b border-glass-border">
        <span className="text-xs font-mono text-primary opacity-80">{language || 'text'}</span>
        <button
          onClick={handleCopy}
          className="text-secondary hover:text-primary transition-colors flex items-center gap-1 text-xs"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
      <div className="relative max-h-[400px] overflow-auto custom-scrollbar">
        <CodeMirrorEditor
          value={code}
          onChange={(val) => setCode(val)}
          language={language}
        />
      </div>
    </div>
  );
}

export class CodeMirrorNode extends DecoratorNode<React.JSX.Element> {
  __code: string;
  __language: string;

  static getType(): string {
    return 'code-mirror';
  }

  static clone(node: CodeMirrorNode): CodeMirrorNode {
    return new CodeMirrorNode(node.__code, node.__language, node.__key);
  }

  constructor(code: string, language: string, key?: NodeKey) {
    super(key);
    this.__code = code;
    this.__language = language;
  }

  createDOM(): HTMLElement {
    const div = document.createElement('div');
    div.className = 'lexical-codemirror-wrapper';
    return div;
  }

  updateDOM(): false {
    return false;
  }

  static importDOM(): DOMConversionMap | null {
    return {
      pre: (node: Node) => {
        const pre = node as HTMLPreElement;
        const code = pre.querySelector('code');
        if (code) {
          const language = code.getAttribute('data-language') || 'text';
          const textContent = code.textContent || '';
          return {
            conversion: () => {
              return { node: $createCodeMirrorNode(textContent, language) };
            },
            priority: 1,
          };
        }
        return null;
      },
    };
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement('pre');
    const codeElement = document.createElement('code');
    codeElement.setAttribute('data-language', this.__language);
    codeElement.textContent = this.__code;
    element.appendChild(codeElement);
    return { element };
  }

  static importJSON(serializedNode: SerializedCodeMirrorNode): CodeMirrorNode {
    const node = $createCodeMirrorNode(serializedNode.code, serializedNode.language);
    return node;
  }

  exportJSON(): SerializedCodeMirrorNode {
    return {
      ...super.exportJSON(),
      code: this.__code,
      language: this.__language,
      type: 'code-mirror',
      version: 1,
    };
  }

  decorate(): React.JSX.Element {
    return (
      <CodeMirrorComponent
        nodeKey={this.getKey()}
        initialCode={this.__code}
        language={this.__language}
      />
    );
  }
}

export function $createCodeMirrorNode(code: string, language: string): CodeMirrorNode {
  return new CodeMirrorNode(code, language);
}

export function $isCodeMirrorNode(node: LexicalNode | null | undefined): node is CodeMirrorNode {
  return node instanceof CodeMirrorNode;
}
