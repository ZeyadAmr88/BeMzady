import React, { useState, useEffect, useRef } from 'react';
import { Bot, X, Send } from 'lucide-react';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [sessionId, setSessionId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        const initializeChat = async () => {
            try {
                const response = await fetch('https://be-mazady.vercel.app/api/chatbot/start', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to initialize chat');
                }

                const data = await response.json();
                setSessionId(data.sessionId);
            } catch (err) {
                setError('Failed to initialize chat. Please try again later.');
                console.error('Chat initialization error:', err);
            }
        };

        initializeChat();
    }, []);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputMessage.trim() || !sessionId) return;

        const userMessage = inputMessage.trim();
        setInputMessage('');
        setMessages(prev => [...prev, { type: 'user', content: userMessage }]);
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('https://be-mazady.vercel.app/api/chatbot/message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    sessionId,
                    message: userMessage,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to send message');
            }

            const data = await response.json();
            setMessages(prev => [...prev, { type: 'bot', content: data.response }]);
        } catch (err) {
            setError('Failed to send message. Please try again.');
            console.error('Message sending error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-4 right-4 z-50">
            {/* Chat Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="bg-gray-800 hover:bg-gray-700 text-white rounded-full p-4 shadow-lg transition-all duration-300 border border-gray-600"
                aria-label="Toggle chat"
            >
                {isOpen ? <X size={24} /> : <Bot size={24} />}
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="absolute bottom-16 right-0 w-[350px] sm:w-[400px] h-[500px] bg-gray-900 rounded-lg shadow-xl flex flex-col border border-gray-700">
                    {/* Chat Header */}
                    <div className="p-4 bg-gray-800 text-white rounded-t-lg border-b border-gray-700">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <Bot size={20} />
                            Chat with us
                        </h3>
                    </div>

                    {/* Messages Container */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-900">
                        {messages.map((message, index) => (
                            <div
                                key={index}
                                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[80%] rounded-lg p-3 ${message.type === 'user'
                                        ? 'bg-gray-700 text-white'
                                        : 'bg-gray-800 text-gray-100 border border-gray-700'
                                        }`}
                                >
                                    {message.content}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-gray-800 rounded-lg p-3 text-gray-100 border border-gray-700">
                                    <div className="flex space-x-2">
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                                    </div>
                                </div>
                            </div>
                        )}
                        {error && (
                            <div className="text-red-400 text-sm text-center">{error}</div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Form */}
                    <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-700 bg-gray-800">
                        <div className="flex space-x-2">
                            <input
                                type="text"
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                placeholder="Type your message..."
                                className="flex-1 p-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 placeholder-gray-400"
                                disabled={isLoading}
                            />
                            <button
                                type="submit"
                                disabled={isLoading || !inputMessage.trim()}
                                className="bg-gray-700 text-white p-2 rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-600"
                            >
                                <Send size={20} />
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default Chatbot; 