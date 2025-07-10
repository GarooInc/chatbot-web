import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';

export default function ChatMessage({ role, content }) {
  const isUser = role === 'user';

  return (
    <div className={`w-full flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`w-full md:w-auto md:max-w-2xl rounded-2xl px-4 py-3 overflow-x-scroll  ${isUser ? 'bg-gray-100 text-black' : 'bg-white text-black'}`}>
        <div className="prose max-w-none mdown">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw, rehypeHighlight]}
            components={{
              img({ src, alt }) {
                if (!src) return null;
                return <img src={src} alt={alt} className="max-w-full h-auto rounded" />;
              },
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
              },
              table({ children }) {
                return (
                  <div className="overflow-x-auto w-full">
                    <table className="w-full table-auto border-collapse">{children}</table>
                  </div>
                );
              },
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}