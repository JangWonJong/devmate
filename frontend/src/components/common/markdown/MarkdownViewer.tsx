import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import "./markdown.css";

function normalizeMarkdown(text: string) {
  return text.replace(/\\`\\`\\`/g, "```");
}

export function MarkdownViewer({ content }: { content?: string }) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  if (!content) return null;

  const handleCopy = async (code: string) => {
    await navigator.clipboard.writeText(code);

    setCopiedCode(code);

    setTimeout(() => {
      setCopiedCode(null);
    }, 1500);
  };

  return (
    <div className="text-sm leading-7 text-slate-700 markdown">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || "");
            const language = match?.[1] ?? "text";
            const code = String(children).replace(/\n$/, "");

            if (inline) {
              return (
                <code
                  className="rounded bg-slate-100 px-1.5 py-0.5 text-sm text-pink-600"
                  {...props}
                >
                  {children}
                </code>
              );
            }

            return (
              <div className="my-5 overflow-hidden rounded-2xl border border-slate-700 bg-[#1f1f24] shadow-sm">
                <div className="flex items-center justify-between bg-[#3b383d] px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-red-400" />
                    <span className="h-3 w-3 rounded-full bg-yellow-400" />
                    <span className="h-3 w-3 rounded-full bg-green-400" />
                    <span className="ml-3 text-xs font-semibold text-slate-200">
                      {language}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopy(code)}
                    className={`rounded-lg px-2 py-1 text-xs font-medium text-white transition ${
                      copiedCode === code
                        ? "bg-emerald-500/30"
                        : "bg-white/10 hover:bg-white/20"
                    }`}
                  >
                    {copiedCode === code ? "복사됨 ✓" : "복사"}
                  </button>
                </div>

                <SyntaxHighlighter
                  language={language}
                  style={vscDarkPlus}
                  showLineNumbers
                  customStyle={{
                    margin: 0,
                    padding: "20px",
                    background: "#1f1f24",
                    fontSize: "14px",
                    lineHeight: "1.7",
                  }}
                  lineNumberStyle={{
                    color: "#64748b",
                    paddingRight: "16px",
                  }}
                >
                  {code}
                </SyntaxHighlighter>
              </div>
            );
          },
        }}
      >
        {normalizeMarkdown(content)}
      </ReactMarkdown>
    </div>
  );
}
