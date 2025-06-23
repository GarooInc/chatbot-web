import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';

export default function ChatMessage({ role, content }) {
  const isUser = role === 'user';

  return (
    <div className={`w-full flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`w-full md:w-auto md:max-w-2xl rounded-2xl px-4 py-3  ${isUser ? 'bg-gray-100 text-black' : 'bg-white  text-black'}`}>
        <div className="prose max-w-none">
        <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight]}
            components={{
            code({ node, inline, className, children, ...props }) {
                return inline ? (
                <code className="bg-gray-100 rounded px-1">{children}</code>
                ) : (
                <pre className="overflow-x-auto rounded-lg bg-gray-900 text-white p-4 my-2">
                    <code className="text-sm" {...props}>
                    {children}
                    </code>
                </pre>
                );
            }
            }}
        >
            {content}
        </ReactMarkdown>
        </div>

      </div>
    </div>
  );
}
