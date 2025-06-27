'use client';
import ChatMessage from '../ChatMessage/ChatMessage';
import { BsStars } from "react-icons/bs";
import { IoExitOutline } from "react-icons/io5";
import { IoPersonOutline } from "react-icons/io5";
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { fetchAgents, fetchConversationsByAgent } from '@/lib/api';


export default function ChatUI() {
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Hi! Ask me anything about **revenue** or _performance_ 📊' },
    ]);
    const [input, setInput] = useState('');
    const navigate = useRouter();
    const { t } = useTranslation();
    const [agents, setAgents] = useState([]);
    const [conversations, setConversations] = useState([]);
    const [currentAgent, setCurrentAgent] = useState(null);
    const [currentConversationId, setCurrentConversationId] = useState(null);


  useEffect(() => {
    async function loadAgentsAndConversations() {
      try {
        const agentsData = await fetchAgents();
        setAgents(agentsData);
      } catch (error) {
        console.error(error.message);
      }
    }

    loadAgentsAndConversations();
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    const responseMd = `\n\n\`\`\`js\nconsole.log("This is a markdown block");\n\`\`\``;
    const botMessage = { role: 'assistant', content: responseMd };

    setTimeout(() => {
      setMessages((prev) => [...prev, botMessage]);
    }, 600);
  };

  const handleAgentChange = async (agent) => {
    setCurrentAgent(agent);
    try {
      const conversationsData = await fetchConversationsByAgent(agent);
      setConversations(conversationsData);
      setMessages([]);
      setMessages([
        { role: 'assistant', content: `You are now chatting with ${agent}.` },
      ]);
    } catch (error) {
      console.error('Error fetching conversations:', error.message);
      setMessages([
        { role: 'assistant', content: 'Error fetching conversations. Please try again later.' },
      ]);
    }
  };

    const handleConversationSelect = (conversation) => {
    setCurrentConversationId(conversation.conversation_id);
    setMessages([
        {
        role: 'assistant',
        content: `Cargando conversación "${conversation.conversation_name}"...`,
        },
    ]);
    };


  return (
    <div className='flex gap-2 w-full bg-gray-50 md:flex-row flex-col'>
        <div className='flex flex-col md:w-1/3 md:p-12 p-4 pt-12 justify-between'>
            <div className='flex flex-col items-center justify-start p-8  border-1 border-gray-300 bg-white h-full rounded-xl relative md:gap-0 gap-4'>
                <img src="/assets/images/logos/logo_v1.png" className="w-40 mb-10" alt='logo' />
                {
                    agents.length > 0 ? (
                        <>
                        <div className="w-full">
                            <h4 className="text-md font-semibold text-black mb-2 uppercase">{t('agents')}</h4>
                            <ul className="space-y-2 w-full">
                            {agents.map((agent) => (
                                <li
                                key={agent}
                                onClick={() => handleAgentChange(agent)}
                                className={`px-4 py-2 rounded-lg text-start cursor-pointer transition-colors duration-200 ${
                                    agent === currentAgent
                                    ? 'bg-gray-900 text-white'
                                    : 'bg-white text-black hover:text-white hover:bg-black border-1 border-black hover:border-none'
                                }`}
                                >
                                {agent}
                                </li>
                            ))}
                            </ul>
                        </div>

                        {/* Conversaciones */}
                        {conversations.length > 0 && (
                            <div className="w-full mt-4">
                            <h4 className="text-md font-semibold text-black mb-2 uppercase">{t('conversations')}</h4>
                            <ul className="space-y-2">
                                {conversations.map((conv) => (
                                <li
                                    key={conv.conversation_id}
                                    onClick={() => handleConversationSelect(conv)}
                                    className={`p-2 rounded-lg cursor-pointer ${
                                    conv.conversation_id === currentConversationId
                                        ? 'bg-gray-900 text-white'
                                        : 'bg-white text-black hover:text-white hover:bg-black border-1 border-black hover:border-none'
                                    }`}
                                >
                                    {conv.conversation_name}
                                </li>
                                ))}
                            </ul>
                            </div>
                        )}
                        </>
                    ) : (
                        <p className='text-gray-500'>No hay agentes disponibles</p>
                    )
                    }



                <div className='w-full md:absolute md:bottom-4 md:left-1/2 md:transform md:-translate-x-1/2 text-gray-500 text-sm rounded-4xl shadow-md md:w-[90%] md:flex justify-between items-center p-4 hidden'>
                    <div className='flex items-center gap-2'>
                        <button className='text-black hover:text-gray-700 border-1 border-gray-300 rounded-full p-2 transition-colors duration-200'>
                            <IoPersonOutline className='w-6 h-6' />
                         </button>
                        <span className='text-gray-700 font-semibold uppercase'>User</span>
                    </div>
                    <button 
                    className='cursor-pointer text-black hover:text-gray-700 border-1 border-gray-300 rounded-full p-2 transition-colors duration-200'
                        onClick={() => navigate.push('/')}
                    >
                        <IoExitOutline className='w-6 h-6' />
                    </button>
                </div>
            </div>
        </div>
        <div className="flex flex-col h-screen bg-gray-50 md:w-2/3 md:p-12 p-4">
            <div className='flex flex-col gap-4 border-1 border-gray-300 bg-white rounded-xl h-full'>
                <div className="flex-1 overflow-y-auto p-6 space-y-2">
                    {messages.map((msg, idx) => (
                    <ChatMessage key={idx} role={msg.role} content={msg.content} />
                    ))}
                </div>
                <form onSubmit={handleSend} className="p-4 border-t bg-white flex items-center gap-2 rounded-2xl">
                    <input
                    type="text"
                    className="text-gray-400 flex-1 border border-gray-400 rounded-xl px-4 py-2 focus:outline-none focus:ring"
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
