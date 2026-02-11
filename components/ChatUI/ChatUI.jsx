'use client';
import React, { useRef } from 'react';
import ChatMessage from '../ChatMessage/ChatMessage';
import { IoIosAddCircle } from "react-icons/io";
import { IoIosArrowDown } from "react-icons/io";
import { FaStop } from "react-icons/fa6";
import { TbLayoutSidebarLeftCollapseFilled } from "react-icons/tb";
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { fetchAgents, fetchConversationsByAgent, fetchMessagesByConversation, sendMessageToConversation, createNewConversation, streamMessageToConversation } from '@/lib/api';
import MenuLeft from '../MenuLeft/MenuLeft';
import { FaArrowUp } from "react-icons/fa";
import { checkSession, signOut } from '@/lib/auth';


export default function ChatUI() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const navigate = useRouter();
    const { t } = useTranslation();
    const [agents, setAgents] = useState([]);
    const [conversationsToday, setConversationsToday] = useState([]);
    const [conversationsPrevious, setConversationsPrevious] = useState([]);
    const [currentAgent, setCurrentAgent] = useState(null);
    const [currentConversationId, setCurrentConversationId] = useState(null);
    const [showToday, setShowToday] = useState(true);
    const [showPrevious, setShowPrevious] = useState(false);
    const [isAwaitingResponse, setIsAwaitingResponse] = useState(false);
    const [isLoadingAgents, setIsLoadingAgents] = useState(false);
    const [username, setUsername] = useState('');
    const [showMenuLeft, setShowMenuLeft] = useState(false);
    const bottomRef = useRef(null);
    const [abortCtrl, setAbortCtrl] = useState(null);
    const [showConversations, setShowConversations] = useState(true);
    const abortedByUserRef = useRef(false);

    const [showTools, setShowTools] = useState(true);
    const [currentTool, setCurrentTool] = useState("");
    const [isLoading, setIsLoading] = useState(false);


  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentTool]);


  const validateSession = async () => {
      try {
        await checkSession();
        console.log('Session is valid. User is authenticated.');
      } catch (err) {
        console.warn('Session expired or user not authenticated. Redirecting to login...');
        navigate.push('/'); 
        localStorage.removeItem('cognitoToken');
        localStorage.removeItem('original_exp');
      }
  };

  useEffect(() => {
    async function loadAgentsAndConversations() {
      try {
        await validateSession();
        const agentsData = await fetchAgents();
        setIsLoadingAgents(true);
        try {
            setAgents(agentsData);
            
            if (typeof window !== 'undefined') {
              const lastAgentId = sessionStorage.getItem('lastUsedAgentId');
              if (lastAgentId && agentsData.length > 0) {
                const lastAgent = agentsData.find(a => a.agent_id === lastAgentId);
                if (lastAgent) {
                  await handleAgentChange(lastAgent);
                  setTimeout(async () => {
                    await handleNewConversation();
                  }, 500);
                }
              }
            }
            
            setTimeout(() => {
            setIsLoadingAgents(false);
          }, 4000);

        } catch (error) {
          console.error('Error loading agents:', error.message);
          setIsLoadingAgents(false);
        }


      } catch (error) {
        console.error(error.message);
      }
    }
    loadAgentsAndConversations();
  }, []);


  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUsername = localStorage.getItem('username');
      setUsername(storedUsername || t('guest'));
    }
  }, []);


  const handleSend = async (e) => {
    e.preventDefault();
    if (isAwaitingResponse) return;
    try {
      await validateSession();
    } catch {
      return;
    }

    if (!input.trim()) return;

    if (!currentAgent || !currentConversationId) {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Please select an agent and a conversation.' },
      ]);
      return;
    }

    const userText = input;
    setInput('');

    setMessages(prev => [
      ...prev,
      { role: 'user', content: userText },
      { role: 'assistant', content: '' }
    ]);
    setIsAwaitingResponse(true);

    const controller = new AbortController();
    setAbortCtrl(controller);

    setCurrentTool(null);
    setShowTools(false);
    setIsLoading(true);


    try {
      await streamMessageToConversation(
        currentConversationId,
        userText,
        {
          signal: controller.signal,
          onToken: (chunk) => {
            const isObj = typeof chunk === 'object' && chunk !== null && 'event' in chunk;
            const event = isObj ? chunk.event : 'answer';
            const data  = isObj ? chunk.data  : String(chunk);

            event? setIsLoading(false) : null;

            if (event === 'tool') {
              setShowTools(true);
              setCurrentTool(data);
              return;
            }

            if (event === 'answer_start') {
              setShowTools(false);
              setCurrentTool(null);
              return;
            }

            if (event === 'answer') {
              setShowTools(false);
              setCurrentTool(null);
              setMessages(prev => {
                if (prev.length === 0) return prev;
                const updated = [...prev];
                const lastIdx = updated.length - 1;
                const last = updated[lastIdx];
                if (!last || last.role !== 'assistant') return prev;
                updated[lastIdx] = { ...last, content: last.content + data };
                return updated;
              });
              return;
            }
          },
          onDone: async () => {
            setIsAwaitingResponse(false);
            setAbortCtrl(null);
            setCurrentTool(null);
            abortedByUserRef.current = false;
            try {
              if (currentConversationId) {
                const messagesData = await fetchMessagesByConversation(currentConversationId);
                setMessages(messagesData);
              }
            } catch (err) {
              console.error('Error reloading messages after streaming:', err?.message || err);
            }
          },
          onError: (err) => {

            const isAbort =
              abortedByUserRef.current ||
              err?.name === 'AbortError' ||
              /aborted|abort/i.test(err?.message || '');

            if (isAbort) {
              setIsAwaitingResponse(false);
              setAbortCtrl(null);
              abortedByUserRef.current = false;
              return; 
            }
            
            setIsAwaitingResponse(false);
            setAbortCtrl(null);
            setMessages(prev => {
              const updated = [...prev];
              const lastIdx = updated.length - 1;
              if (updated[lastIdx]?.role === 'assistant') {
                updated[lastIdx] = {
                  role: 'assistant',
                  content: 'Error streaming response. Please try again.'
                };
              }
              return updated;
            });
          },
        }
      );
    } catch (err) {
    }
  };

  const handleStop = () => {
  if (abortCtrl) {
    abortedByUserRef.current = true;
    try { abortCtrl.abort(); } catch {}
    }
    setIsAwaitingResponse(false);
    setAbortCtrl(null);
    setIsLoading(false);
  };

  const handleShowConversations = () => {
    setShowConversations(prev => !prev);
  };



  const handleAgentChange = async (agent) => {
    try {
      await validateSession(); 
    } catch {
      return;
    }
    
    // Saving selected agent in sessionStorage and localStorage
    localStorage.setItem('selectedAgentId', agent.agent_id);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('lastUsedAgentId', agent.agent_id);
    }
    
    setCurrentAgent(agent);
    setCurrentConversationId(null); // Clear conversation when changing agent
    try {
      const conversationsData = await fetchConversationsByAgent(agent.agent_id);
      setConversationsToday(conversationsData.today || []);
      setConversationsPrevious(conversationsData.previous || []);
      setMessages([]);
    } catch (error) {
      console.error('Error fetching conversations:', error.message);
      setMessages([
        { role: 'assistant', content: 'Error fetching conversations. Please try again later.' },
      ]);
    }
  };

    const handleConversationSelect = async (conversation) => {
      setCurrentConversationId(conversation.conversation_id);
      setMessages([]);

      try {
        const messagesData = await fetchMessagesByConversation(conversation.conversation_id);
        setMessages(messagesData);
      } catch (error) {
        console.error('Error fetching messages:', error.message);
        setMessages([
          { role: 'assistant', content: 'Error fetching messages. Please try again later.' },
        ]);
      } 
    };

    const handleNewConversation = async () => {
    try {
      await validateSession(); 
    } catch {
      return;
    }
    const defaultName = `Nuevo Chat`;
    if (defaultName && currentAgent) {
      try {
        await createNewConversation(currentAgent.agent_id, defaultName);

        const refreshed = await fetchConversationsByAgent(currentAgent.agent_id);
        setConversationsToday(refreshed.today || []);
        setConversationsPrevious(refreshed.previous || []);

        const newest = refreshed.today[0];

        if (!newest || !newest.conversation_id) {
          setMessages((prev) => [
            ...prev,
            { role: 'assistant', content: 'Error: no se pudo identificar la nueva conversación.' },
          ]);
          return;
        }

        setCurrentConversationId(newest.conversation_id);

        const messages = await fetchMessagesByConversation(newest.conversation_id);
        setMessages(messages);
      } catch (error) {
        console.error('Error creating new conversation:', error.message);
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: 'Error creating new conversation. Please try again later.' },
        ]);
      }
    }
  };

  // Helper to reload messages for the current conversation
  const reloadMessages = async () => {
    if (!currentConversationId) return;
    try {
      const messagesData = await fetchMessagesByConversation(currentConversationId);
      setMessages(messagesData);
    } catch (err) {
      console.error('Error reloading messages:', err?.message || err);
    }
  };


  return (
    <div className='flex w-full bg-[#F8FAFC] md:flex-row flex-col h-full max-h-screen'>
        <div className='flex md:flex-col bg-white justify-between p-4'>
            <div className='flex md:flex-col items-center h-screen'>
              <button
                className={`mb-4 focus:outline-none ${showConversations ? '' : 'cursor-pointer'}`}
                onClick={
                  showConversations ? () => {} : () => setShowConversations(true)
                }
              >
                <img
                  src="/assets/images/logos/logo_v2.png"
                  alt="Logo"
                  className="md:w-8 w-4 h-4 md:h-auto mb-4 mx-auto md:mx-0"
              /> 
              </button>
              <MenuLeft />
            </div>
        </div>
        <div className={`flex flex-col md:w-1/3 min-h-0 ${showConversations ? 'block' : 'hidden'} `}>
              <div className='w-full border-b border-gray-300 flex justify-between p-4 items-center md:h-14'>
                <img
                    src="/assets/images/logos/logo_v1.png"
                    alt="Logo"  
                    className="w-20 h-auto mx-auto md:mx-0"
                  /> 
                  <button
                    className={`h-8 w-8 rounded-full transition-colors duration-200 text-[#CC1D1A] ${!currentAgent ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:text-red-600 '}`}
                    onClick={handleNewConversation}
                  >
                    <IoIosAddCircle className='w-full h-full' />
                  </button>
              </div>
            <div className='flex flex-col bg-[#F8FAFC] relative gap-4 h-full min-h-0 flex-1'>
                <div className="flex flex-col w-full flex-1 min-h-0">
                {
                    isLoadingAgents ? (
                        <div className="flex justify-center items-center h-full">
                            <span className="loading loading-ring loading-xl text-black"></span>
                        </div>
                    ) :(
                      <div className="w-full flex flex-col flex-1 overflow-y-auto">
                        {agents.length > 0 && (
                        <div className='flex justify-between'>
                            <h4 className="text-md font-light text-gray-400 mb-2 capitalize py-2 px-4">{t('agents')}</h4>
                          <button
                            className="h-8 w-8 rounded-full transition-colors duration-200 text-[#CC1D1A] cursor-pointer"
                            onClick={handleShowConversations}
                          >
                            <TbLayoutSidebarLeftCollapseFilled className='w-6 h-6' />
                        </button>
                        </div>
                        )}
                        <ul className="space-y-2 w-full">
                        {agents.map((agent) => (
                          <li
                            key={agent.agent_id}
                            onClick={() => handleAgentChange(agent)}
                            className={`px-4 py-2 text-start cursor-pointer transition-colors duration-200 ${
                              agent === currentAgent
                                ? 'bg-gray-200 text-black'
                                : 'bg-white text-black hover:bg-gray-200 hover:border-none'
                            }`}
                          >
                            {agent.agent_name}
                          </li>
                        ))}
                      </ul>
                      {/* Today */}
                      {conversationsToday.length > 0 && (
                        <div className="w-full overflow-y-scroll min-h-20">
                          <div className='flex justify-between items-center px-4 py-2 text-gray-500 font-semibold w-full'>
                            <div className='flex gap-2'>
                              <span>Today</span>
                            </div>
                            <button
                              onClick={() => setShowToday(prev => !prev)}
                              className="flex items-center  gap-4 text-gray-500 font-semibold cursor-pointer"
                            >
                              <span className='font-light'>{conversationsToday.length}</span>
                              <IoIosArrowDown className={`w-4 h-4 transition-transform duration-200 ${showToday ? 'transform rotate-180' : ''}`} />
                            </button>
                          </div>
                          {showToday && (
                            <ul className="space-y-1">
                              {conversationsToday.map((conv) => (
                                <li
                                  key={conv.conversation_id}
                                  onClick={() => handleConversationSelect(conv)}
                                  className={`px-4 py-2 cursor-pointer text-sm ${
                                    conv.conversation_id === currentConversationId
                                      ? 'bg-gray-200 text-black rounded'
                                      : 'text-black hover:bg-gray-100 rounded'
                                  }`}
                                >
                                  {conv.conversation_name}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )}

                      {/* Previous 7 Days */}
                      {conversationsPrevious.length > 0 && (
                        <div className="w-full mt-4">
                          <div className='flex justify-between items-center px-4 py-2 text-gray-500 font-semibold w-full'>
                            <div className='flex gap-2'>
                              <span>Previous</span>
                            </div>
                            <button
                              onClick={() => setShowPrevious(prev => !prev)}
                              className="flex items-center gap-4 text-gray-500 font-semibold cursor-pointer"
                            > 
                              <span className='font-light'>{conversationsPrevious.length}</span>
                              <IoIosArrowDown className={`w-4 h-4 transition-transform duration-200 ${showPrevious ? 'transform rotate-180' : ''}`} />
                            </button>
                          </div>
                          {showPrevious && (
                            <ul className="space-y-1">
                              {conversationsPrevious.map((conv) => (
                                <li
                                  key={conv.conversation_id}
                                  onClick={() => handleConversationSelect(conv)}
                                  className={`px-4 py-2 cursor-pointer text-sm ${
                                    conv.conversation_id === currentConversationId
                                      ? 'bg-gray-200 text-black rounded'
                                      : 'text-black hover:bg-gray-100 rounded'
                                  }`}
                                >
                                  {conv.conversation_name}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )}

                    </div>
                    )
                }
                </div>
            </div>
        </div>
        <div className={`flex flex-col h-screen ${showConversations ? 'md:w-2/3' : 'w-full'} flex-1 min-h-0`}>
          <div className='flex flex-col bg-white h-full'>
              <div className="flex items-center justify-start p-4 border-b border-gray-300 bg-white md:h-14">
                {
                  currentAgent && (
                    <img
                      src={currentAgent.business_logo_url || ''}
                      alt={currentAgent.agent_name}
                      className="w-40 mr-2"
                    />
                  )
                }
                {
                  currentAgent && (
                    <span className="text-gray-700 font-bold text-sm">
                      - {currentConversationId
                      ? (
                          [...conversationsPrevious, ...conversationsToday].find(
                            conv => conv.conversation_id === currentConversationId
                          )?.conversation_name || 'New Conversation'
                        )
                      : " "}
                    </span>
                  )
                }
              </div>
              <div className="flex-1 overflow-y-scroll space-y-2 px-10 py-4 custom-scrollbar relative">
                {
                  !currentAgent && (
                    <div className="flex flex-col gap-2 justify-center items-center h-full">
                      <span className="text-black text-xl">
                        What do you need today, {username}?
                      </span>
                      <span className="text-gray-500 text-sm">
                        Select an agent to start chatting.
                      </span>
                    </div>
                  )
                }
                {currentAgent && !currentConversationId && (
                    <div className="flex flex-col gap-2 justify-center items-center h-full">
                      <span className="text-gray-500 text-sm">
                        Select or create a conversation to start chatting.
                      </span>
                    </div>
                  )
                }
                {
                  messages.length > 0 && messages.map((msg, index) => (
                    <ChatMessage
                      key={index}
                      role={msg.role}
                      content={msg.content}
                      id_msg={msg.message_id}
                      conversationId={currentConversationId}
                      rating={msg.rating}
                      onRated={reloadMessages}
                    />
                  ))}

                {isLoading && (
                  <div className="skeleton h-4 w-full bg-white"></div>
                )}

                {showTools && currentTool && (
                      <ChatMessage
                      role="assistant"
                      content={`Usando: ${currentTool}`}
                      />
                )}
                <div ref={bottomRef} />
              </div>
              <div className='flex flex-col'>
                <form onSubmit={handleSend} 
                className={`border rounded-full bg-white flex items-center gap-2 m-4 mx-10 p-2`}
                onKeyDown={(e) => {
                    if (isAwaitingResponse && (e.key === 'Enter' || e.code === 'Enter')) {
                      e.preventDefault();
                      e.stopPropagation();
                    }
                  }}>
                  <input
                    type="text"
                    className={`flex-1 rounded-xl focus:outline-none focus:ring-none bg-white p-2 ${!currentAgent || !currentConversationId ? 'bg-gray-100 cursor-not-allowed' : 'bg-white text-black'}`}
                    placeholder={t('message')}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={!currentAgent || !currentConversationId || isAwaitingResponse}
                    onKeyDown={(e) => {
                      if (e.code === 'Space' || e.key === ' ') {
                        e.stopPropagation();
                      }
                    }}
                    />
                    {!isAwaitingResponse ? (
                      <button
                        type="submit"
                        disabled={!currentAgent || !currentConversationId}
                        className={`bg-[#CC1D1A] hover:bg-red-600 text-white p-2 rounded-full ${!currentAgent || !currentConversationId ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <FaArrowUp className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleStop}
                        className=" p-2 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-600"
                      >
                        <FaStop className="w-4 h-4 text-[#CC1D1A]" />
                      </button>
                    )}
                </form>
                <span className="text-gray-500 text-sm p-4 text-center">
                    {t('chat_ui_footer')}
                </span>
              </div>
            </div>
          </div>
        </div>
  );
}
