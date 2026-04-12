import React, { useState, useEffect, useRef, useContext } from 'react'
import { ShopContext } from '../context/ShopContext'
import axios from 'axios'
import { Send, User, Bot, MessageSquare, Package, RotateCcw, AlertTriangle, X, Minus, MessageCircle, Image as ImageIcon, Camera, Trash2, LogOut } from 'lucide-react'
import { toast } from 'react-toastify'

const ChatWidget = () => {
    const { token, backendUrl, userData, navigate, getUserTickets } = useContext(ShopContext);
    const [isOpen, setIsOpen] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [messages, setMessages] = useState(() => {
        const saved = sessionStorage.getItem('chat_history');
        return saved ? JSON.parse(saved) : [
            { text: `Hi ${userData ? userData.name : 'there'}! I'm your Forever AI Assistant. How can I help you today?`, isBot: true }
        ];
    });
    const [input, setInput] = useState('');
    const [complaintMode, setComplaintMode] = useState(false);
    const [image, setImage] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);
    const messagesEndRef = useRef(null);
    const widgetRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    const endChat = () => {
        if (window.confirm("Are you sure you want to end this chat and clear the history?")) {
            setMessages([
                { text: `Hi ${userData ? userData.name : 'there'}! I'm your Forever AI Assistant. How can I help you today?`, isBot: true }
            ]);
            sessionStorage.removeItem('chat_history');
            setComplaintMode(false);
            setImage(null);
        }
    }

    useEffect(() => {
        scrollToBottom();
        sessionStorage.setItem('chat_history', JSON.stringify(messages));
    }, [messages]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isOpen && widgetRef.current && !widgetRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    const handleSend = async (e, customMsg = null) => {
        if (e) e.preventDefault();
        const msgText = customMsg || input;
        if (!msgText.trim()) return;

        if (!token) {
            setMessages(prev => [...prev, { text: msgText, isBot: false }, { text: "Please login to chat with our AI assistant and track your orders.", isBot: true }]);
            setInput('');
            return;
        }

        const newMessages = [...messages, { text: msgText, isBot: false }];
        setMessages(newMessages);
        setInput('');
        setIsTyping(true);

        try {
            // Check for complaint flow
            if (complaintMode) {
                if (image) setIsUploading(true);
                
                const formData = new FormData();
                formData.append('subject', "Customer Complaint");
                formData.append('message', msgText);
                if (image) {
                    formData.append('image', image);
                }

                if (image) {
                    setMessages(prev => [...prev, { text: "Uploading photo... Please wait.", isBot: true }]);
                }

                const response = await axios.post(backendUrl + '/api/chat/ticket', formData, { headers: { token } });
                
                if (response.data.success) {
                    const ticketId = response.data.ticketId;
                    const now = new Date();
                    const day = now.toLocaleDateString('en-US', { weekday: 'long' });
                    const date = now.toLocaleDateString();
                    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    
                    const successMsg = `Ticket ID: #${ticketId} | Raised on: ${day}, ${date} at ${time}. You can track its status in the 'Support Tickets' section.`;
                    
                    setMessages(prev => [...prev, { text: successMsg, isBot: true }]);
                    setComplaintMode(false);
                    setImage(null);
                    setIsUploading(false);
                    
                    // Refresh tickets list
                    getUserTickets();
                }
            } else {
                const response = await axios.post(backendUrl + '/api/chat/message', {
                    message: msgText,
                    history: messages
                }, { headers: { token } });

                if (response.data.success) {
                    setMessages(prev => [...prev, { text: response.data.reply, isBot: true }]);
                }
            }
        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { text: "Sorry, I'm having trouble connecting to the server. Please try again later.", isBot: true }]);
        } finally {
            setIsTyping(false);
            setIsUploading(false);
        }
    }

    const quickActions = [
        { label: "Track Last Order", icon: <Package size={16} />, text: "Where is my last order?" },
        { label: "Return Policy", icon: <RotateCcw size={16} />, text: "What is your return policy?" },
        { label: "File Complaint", icon: <AlertTriangle size={16} />, action: () => {
            setMessages(prev => [...prev, { text: "I'm sorry to hear that. Please describe the issue in detail, and I'll create a support ticket for you.", isBot: true }]);
            setComplaintMode(true);
        }},
    ];

    return (
        <div ref={widgetRef} className='fixed bottom-8 right-24 z-[9999] font-sans pointer-events-none'>
            {/* Chat Window */}
            {isOpen && (
                <div className='absolute bottom-0 right-0 w-[350px] sm:w-[400px] h-[550px] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300 pointer-events-auto'>
                    {/* Header */}
                    <div className='bg-black text-white p-5 flex items-center justify-between shadow-lg'>
                        <div className='flex items-center gap-3'>
                            <div className='bg-white/20 p-2 rounded-full'>
                                <Bot size={20} className='text-white' />
                            </div>
                            <div>
                                <p className='text-sm font-bold prata-regular'>Forever AI Support</p>
                                <div className='flex items-center gap-1.5'>
                                    <div className='w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse'></div>
                                    <span className='text-[10px] text-gray-300 uppercase tracking-widest'>Online</span>
                                </div>
                            </div>
                        </div>
                        <div className='flex items-center gap-2'>
                            <button onClick={() => setIsOpen(false)} title="Minimize" className='p-1.5 hover:bg-white/10 rounded-full transition-colors'><Minus size={20} /></button>
                            <button onClick={endChat} title="End Chat" className='p-1.5 hover:bg-white/10 rounded-full transition-colors text-red-300'><Trash2 size={20} /></button>
                        </div>
                    </div>

                    {/* Messages Section */}
                    <div className='flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-gray-50/50'>
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex gap-2 ${msg.isBot ? 'justify-start' : 'justify-end'}`}>
                                {msg.isBot && (
                                    <div className='w-8 h-8 rounded-full bg-black flex items-center justify-center shrink-0'>
                                        <Bot size={16} className='text-white' />
                                    </div>
                                )}
                                <div className={`max-w-[75%] p-3.5 rounded-2xl text-[13px] leading-relaxed shadow-sm ${
                                    msg.isBot 
                                    ? 'bg-white text-gray-700 rounded-tl-none border border-gray-100' 
                                    : 'bg-black text-white rounded-tr-none'
                                }`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className='flex gap-2 justify-start'>
                                <div className='w-8 h-8 rounded-full bg-black flex items-center justify-center shrink-0'>
                                    <Bot size={16} className='text-white' />
                                </div>
                                <div className='bg-white border border-gray-100 p-3.5 rounded-2xl rounded-tl-none flex gap-1 items-center shadow-sm'>
                                    <div className='w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce'></div>
                                    <div className='w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.2s]'></div>
                                    <div className='w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.4s]'></div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Actions */}
                    {!complaintMode && messages.length < 5 && (
                        <div className='px-4 py-2 flex gap-2 overflow-x-auto scrollbar-hide bg-gray-50/50'>
                            {quickActions.map((action, idx) => (
                                <button 
                                    key={idx} 
                                    onClick={() => action.action ? action.action() : handleSend(null, action.text)}
                                    className='flex items-center gap-2 whitespace-nowrap bg-white border border-gray-200 px-3 py-1.5 rounded-full text-xs font-medium text-gray-600 hover:border-black hover:text-black transition-all shadow-sm shrink-0'
                                >
                                    {action.icon}
                                    {action.label}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Input Field */}
                    <form onSubmit={handleSend} className='p-4 bg-white border-t border-gray-100 flex items-center gap-2'>
                        {complaintMode && (
                            <>
                                <input 
                                    type="file" 
                                    hidden 
                                    ref={fileInputRef} 
                                    onChange={(e) => setImage(e.target.files[0])}
                                    accept="image/*"
                                />
                                <button 
                                    type='button'
                                    onClick={() => fileInputRef.current.click()}
                                    className={`p-2 rounded-lg transition-colors shadow-sm ${image ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                                >
                                    {image ? <ImageIcon size={18} /> : <Camera size={18} />}
                                </button>
                            </>
                        )}
                        <div className='flex-1 relative'>
                            <input 
                                type="text" 
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder={complaintMode ? 'Describe your issue...' : 'Ask about your order, returns...'} 
                                className='w-full pl-4 pr-10 py-3 bg-gray-100 rounded-xl text-sm outline-none focus:ring-1 focus:ring-black/5 transition-all'
                            />
                            <button type='submit' className='absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors shadow-lg'>
                                <Send size={16} />
                            </button>
                        </div>
                    </form>
                    
                    <div className='bg-white px-4 pb-3 text-[10px] text-center text-gray-400'>
                        Powered by Forever AI • Professional Support
                    </div>
                </div>
            )}

            {/* Hidden toggle for ActionHub to trigger */}
            <button 
                id="chat-widget-trigger" 
                className="hidden" 
                onClick={() => setIsOpen(prev => !prev)}
                aria-hidden="true"
            />
        </div>
    )
}

export default ChatWidget
