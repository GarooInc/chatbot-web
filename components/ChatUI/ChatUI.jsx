'use client';
import ChatMessage from '../ChatMessage/ChatMessage';
import { CiCirclePlus } from "react-icons/ci";
import { IoExitOutline } from "react-icons/io5";
import { IoPersonOutline } from "react-icons/io5";
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { fetchAgents, fetchConversationsByAgent, fetchMessagesByConversation, sendMessageToConversation, createNewConversation } from '@/lib/api';


export default function ChatUI() {
    const [messages, setMessages] = useState([
        { role: 'assistant', content: '' },
    ]);
    const [input, setInput] = useState('');
    const navigate = useRouter();
    const { t } = useTranslation();
    const [agents, setAgents] = useState([]);
    const [conversations, setConversations] = useState([]);
    const [currentAgent, setCurrentAgent] = useState(null);
    const [currentConversationId, setCurrentConversationId] = useState(null);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [isLoadingAgents, setIsLoadingAgents] = useState(false);
    const [username, setUsername] = useState('');




  useEffect(() => {
    async function loadAgentsAndConversations() {
      try {
        const agentsData = await fetchAgents();
        setIsLoadingAgents(true);
        try {
            setAgents(agentsData);
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
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    if (!currentAgent || !currentConversationId) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Please select an agent and a conversation.' },
      ]);
      return;
    }

    try {
      setIsLoadingMessages(true);
      await sendMessageToConversation(currentAgent, currentConversationId, input);

      const updatedMessages = await fetchMessagesByConversation(currentAgent, currentConversationId);
      setMessages(updatedMessages);
    } catch (error) {
      console.error('Error sending message:', error.message);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Error sending message. Please try again later.' },
      ]);
    } finally {
      setIsLoadingMessages(false); 
    }
  };


  const handleAgentChange = async (agent) => {
    setCurrentAgent(agent);
    try {
      const conversationsData = await fetchConversationsByAgent(agent);
      setConversations(conversationsData);
      setMessages([]);
      setMessages([
        { role: 'assistant', content: `Select or create a conversation with ${agent} to start chatting.` },
      ]);
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
      setIsLoadingMessages(true);

      try {
        const messagesData = await fetchMessagesByConversation(currentAgent, conversation.conversation_id);
        setMessages(messagesData);
      } catch (error) {
        console.error('Error fetching messages:', error.message);
        setMessages([
          { role: 'assistant', content: 'Error fetching messages. Please try again later.' },
        ]);
      } finally {
        setIsLoadingMessages(false);
      }
    };

    const handleNewConversation = async () => {
    const defaultName = `chat-${conversations.length + 1}`;
    if (defaultName && currentAgent) {
      try {
        await createNewConversation(currentAgent, defaultName);

        const refreshed = await fetchConversationsByAgent(currentAgent);
        setConversations(refreshed);

        const newest = refreshed[refreshed.length - 1];

        if (!newest || !newest.conversation_id) {
          setMessages((prev) => [
            ...prev,
            { role: 'assistant', content: 'Error: no se pudo identificar la nueva conversación.' },
          ]);
          return;
        }

        setCurrentConversationId(newest.conversation_id);

        const messages = await fetchMessagesByConversation(currentAgent, newest.conversation_id);
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

  const handleLogout = () => {
    localStorage.removeItem('cognitoToken');
    navigate.push('/');
  };


  return (
    <div className='flex gap-2 w-full bg-gray-50 md:flex-row flex-col h-full max-h-screen'>
        <div className='flex flex-col md:w-1/3 md:p-12 p-4 pt-12 min-h-0'>
            <div className='flex flex-col p-8 border border-gray-300 bg-white rounded-xl relative gap-4 h-full min-h-0 overflow-hidden flex-1'>
                <img src="/assets/images/logos/logo_v1.png" className="w-40 mb-10" alt='logo' />
                <div className="flex flex-col w-full flex-1 min-h-0">
                {
                    isLoadingAgents ? (
                        <div className="flex justify-center items-center h-full">
                            <span className="loading loading-ring loading-xl text-black"></span>
                        </div>
                    ) :(
                      <div className="w-full flex flex-col flex-1 min-h-0">
                        {agents.length > 0 && (
                          <h4 className="text-md font-light text-gray-400 mb-2 capitalize">{t('agents')}</h4>
                        )}
                        <ul className="space-y-2 w-full h-1/4 overflow-auto">
                          {agents.map((agent) => (
                              <li
                              key={agent}
                              onClick={() => handleAgentChange(agent)}
                              className={`px-4 py-2 rounded-lg text-start cursor-pointer transition-colors duration-200 ${
                                  agent === currentAgent
                                  ? 'bg-gray-200 text-black'
                                  : 'bg-white text-black  hover:bg-gray-200 hover:border-none'
                              }`}
                              >
                              {agent}
                              </li>
                          ))}
                          </ul>
                        {/* Conversaciones */}
                        {
                          agents.length > 0 && currentAgent && (
                          <div className='flex justify-between'>
                              <h4 className="text-md font-light text-gray-400 mb-2 capitalize">{t('conversations')}</h4>
                              <button
                                className="text-gray-500 hover:text-gray-700"
                                onClick={handleNewConversation}
                              >
                                <CiCirclePlus className='w-6 h-6 cursor-pointer text-gray-400 hover:text-gray-600' />
                              </button>
                          </div>
                        )}
                        {conversations.length > 0 && (
                            <div className={`flex-1 overflow-y-auto mt-2 pr-1`}>
                            
                            <ul className="space-y-2">
                                {conversations.map((conv) => (
                                <li
                                    key={conv.conversation_id}
                                    onClick={() => handleConversationSelect(conv)}
                                    className={`p-2 rounded-lg cursor-pointer ${
                                    conv.conversation_id === currentConversationId
                                        ? 'bg-gray-200 text-black'
                                        : 'bg-white text-black  hover:bg-gray-200 hover:border-none'
                                    }`}
                                >
                                    {conv.conversation_name}
                                </li>
                                ))}
                            </ul>
                            </div>
                        )}
                      </div>
                    )
                }
                </div>

                <div className={`w-full text-gray-500 text-sm rounded-4xl shadow-md  md:flex justify-between items-center p-4 ${conversations.length > 6 ? 'block md:w-full' : 'md:absolute md:bottom-4 md:left-1/2 md:transform md:-translate-x-1/2 md:w-[90%]'}`}>
                    <div className='flex items-center gap-2'>
                        <button className='text-black hover:text-gray-700 border-1 border-gray-300 rounded-full p-2 transition-colors duration-200'>
                            <IoPersonOutline className='w-6 h-6' />
                         </button>
                        <span className='text-gray-700 font-semibold uppercase'>
                            {username || t('guest')}
                        </span>
                    </div>
                    <button 
                    className='cursor-pointer text-black hover:text-gray-700 border-1 border-gray-300 rounded-full p-2 transition-colors duration-200'
                        onClick={
                            handleLogout
                        }
                    >
                        <IoExitOutline className='w-6 h-6' />
                    </button>
                </div>
            </div>
        </div>
        <div className="flex flex-col h-screen bg-gray-50 md:w-2/3 md:p-12 p-4">
            <div className='flex flex-col gap-4 border-1 border-gray-300 bg-white rounded-xl h-full'>
                <div className="flex-1 overflow-y-auto p-6 space-y-2">
                    {isLoadingMessages ? (
                      <div className="flex justify-center items-center h-full">
                        <span className="loading loading-ring loading-xl text-black"></span>
                      </div>
                    ) : (
                      messages.map((msg, idx) => (
                        <ChatMessage key={idx} role={msg.role} content={msg.content} />
                      ))
                    )}
                  </div>
                <form onSubmit={handleSend} className="p-4 border-t bg-white flex items-center gap-2 rounded-2xl">
                    <input
                    type="text"
                    disabled={!currentAgent || !currentConversationId}
                    className={`flex-1 p-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#CC1D1A] transition-colors duration-200 ${!currentAgent || !currentConversationId ? 'bg-gray-100 cursor-not-allowed' : 'bg-white text-black'}`}
                    placeholder={t('message')}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    />
                    <button
                    type="submit"
                    className="bg-[#CC1D1A] hover:bg-red-600 text-white px-4 py-2 rounded-xl"
                    >
                    {t('send')}
                    </button>
                </form>
            </div>
        </div>
    </div>
  );
}
