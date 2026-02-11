"use client"
import React, { useState } from 'react'
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import { PiThumbsUpDuotone } from "react-icons/pi";
import { PiThumbsDownDuotone } from "react-icons/pi";
import { rateMessage } from '@/lib/api';
import Toast from '../Toast/Toast';
import { useRouter } from 'next/navigation';


const ChatMessage = ({ role, content, id_msg, conversationId, rating, onRated }) => {
  const isUser = role === 'user';
  const router = useRouter();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  
  function Seccion({ children, ...props }) {
    return <section {...props}>{children}</section>;
  }

  const handleRating = async (score) => {
    try {
      await rateMessage(conversationId, id_msg, score);
      setShowToast(true);
      setToastMessage("Gracias por tu calificación.");
      setToastType('success');
      setTimeout(() => setShowToast(false), 3000);
      if (onRated && typeof onRated === 'function') {
        onRated();
      } else {
        router.refresh();
      }
      console.log('Rating submitted successfully');
    } catch (error) {
      console.error('Error al calificar el mensaje:', error);
      setToastMessage('Error al calificar el mensaje. Por favor, inténtalo de nuevo.');
      setToastType('error');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };


  return (
    <div className={`w-full flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 relative messages`}>
      {showToast && <Toast message={toastMessage} type={toastType} />}
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
                  <code>{children}</code>
                ) : (
                    <code className={`text-sm text-white p-1 rounded overflow-x-auto
                     ${className || ''}`} {...props}>
                      {children}
                    </code>
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
  {!isUser && id_msg && (
        <div className="absolute bottom-0 left-0 transform translate-x-1/2 translate-y-1/2 flex gap-2">
          <PiThumbsUpDuotone 
          onClick={() => handleRating(1)}
          className={`w-4 h-4 cursor-pointer ${rating?.status === 1 ? 'text-green-600' : 'text-gray-400 hover:text-gray-600'}`} />
          <PiThumbsDownDuotone 
          onClick={() => handleRating(-1)} 
          className={`w-4 h-4 cursor-pointer ${rating?.status === -1 ? 'text-red-600' : 'text-gray-400 hover:text-gray-600'}`} />
        </div>
      )}
    </div>
  );
}

export default ChatMessage;