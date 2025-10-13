import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import { PiThumbsUpDuotone } from "react-icons/pi";
import { PiThumbsDownDuotone } from "react-icons/pi";
import { rateMessage } from '@/lib/api';


const ChatMessage = ({ role, content, id_msg, conversationId, rating }) => {
  const isUser = role === 'user';
  
  function Seccion({ children, ...props }) {
    return <section {...props}>{children}</section>;
  }

  const handleRating = async (rating) => {
    try {
      await rateMessage(conversationId, id_msg, rating);
      console.log(`Mensaje ${id_msg} calificado con ${rating}`);
    } catch (error) {
      console.error('Error al calificar el mensaje:', error);
    }
  };


  return (
    <div className={`w-full flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 relative`}>
      <div className={`w-full md:w-auto md:max-w-2xl rounded-2xl px-4 py-3 overflow-x-scroll ${isUser ? 'bg-gray-100 text-black' : 'bg-white text-black'}`}>
        <div className="prose max-w-none mdown">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw, rehypeHighlight]}
            components={{
              seccion: Seccion,
              p({ node, children, ...props }) {
                return <p {...props} style={{ whiteSpace: 'pre-wrap' }}>{children}</p>;
              },
              img({ src, alt }) {
                if (!src) return null;
                return <img src={src} alt={alt} className="max-w-full h-auto rounded" />;
              },
              code({ node, inline, className, children, ...props }) {
                return inline ? (
                  <code className="bg-gray-100 rounded px-1">{children}</code>
                ) : (
                  <pre className="overflow-x-auto rounded-lg bg-gray-900 text-white p-4 my-2">
                    <code className={`text-sm ${className || ''}`} {...props}>
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
            {content.replace(/\\n/g, '\n')}
          </ReactMarkdown>
        </div>
      </div>
      {!isUser && rating.status == 0 && (
        <div className="absolute bottom-0 left-0 transform translate-x-1/2 translate-y-1/2 flex">
          <PiThumbsUpDuotone 
          onClick={() => handleRating(1)}
          className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600" />
          <PiThumbsDownDuotone onClick={() => handleRating(-1)} className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600 ml-2" />
        </div>
      )}
    </div>
  );
}

export default ChatMessage;