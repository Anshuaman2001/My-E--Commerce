import React, { useContext, useEffect } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from '../components/Title'
import { Ticket, Clock, CheckCircle, AlertCircle, Image as ImageIcon, MessageSquare, ChevronRight, Calendar, RotateCcw } from 'lucide-react'

const Support = () => {
    const { userTickets, getUserTickets, currency, navigate } = useContext(ShopContext);

    useEffect(() => {
        getUserTickets();
    }, []);

    const getStatusStyles = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending': return 'bg-orange-50 text-orange-600 border-orange-100';
            case 'resolved': return 'bg-green-50 text-green-600 border-green-100';
            case 'closed': return 'bg-gray-50 text-gray-500 border-gray-100';
            default: return 'bg-blue-50 text-blue-600 border-blue-100';
        }
    }

    const getStatusIcon = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending': return <Clock size={16} />;
            case 'resolved': return <CheckCircle size={16} />;
            case 'closed': return <CheckCircle size={16} />;
            default: return <AlertCircle size={16} />;
        }
    }

    return (
        <div className='border-t pt-16 min-h-screen bg-white/50'>
            <div className='flex items-center justify-between'>
                <div className='text-2xl'>
                    <Title text1={'MY'} text2={'TICKETS'} />
                </div>
                <button 
                    onClick={getUserTickets}
                    className='flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-full text-sm transition-all shadow-sm'
                >
                    <RotateCcw size={16} />
                    Refresh
                </button>
            </div>

            <div className='mt-10 max-w-5xl mx-auto'>
                {userTickets.length === 0 ? (
                    <div className='flex flex-col items-center justify-center py-20 bg-gray-50/50 rounded-3xl border border-dashed border-gray-200'>
                        <div className='bg-white p-6 rounded-full shadow-sm mb-4'>
                            <MessageSquare size={48} className='text-gray-300' />
                        </div>
                        <p className='text-gray-500 font-medium'>No support tickets found</p>
                        <p className='text-gray-400 text-sm mt-1'>Need help? Chat with our assistant to file a complaint.</p>
                    </div>
                ) : (
                    <div className='grid gap-6 px-4'>
                        {userTickets.map((item, index) => (
                            <div 
                                key={index} 
                                className='bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden'
                            >
                                <div className='p-6'>
                                    <div className='flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-gray-50'>
                                        <div className='flex items-center gap-4'>
                                            <div className='bg-black p-3 rounded-xl shadow-lg'>
                                                <Ticket className='text-white' size={24} />
                                            </div>
                                            <div>
                                                <h3 className='font-bold text-gray-900 text-lg'>{item.subject}</h3>
                                                <div className='flex items-center gap-2 mt-1'>
                                                    <Calendar size={14} className='text-gray-400' />
                                                    <p className='text-xs text-gray-500'>
                                                        {new Date(item.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })} at {new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-bold uppercase tracking-wider ${getStatusStyles(item.status)}`}>
                                            {getStatusIcon(item.status)}
                                            {item.status}
                                        </div>
                                    </div>

                                    <div className='grid md:grid-cols-4 gap-8'>
                                        <div className='md:col-span-3'>
                                            <div className='flex items-start gap-3 mb-2'>
                                                <MessageSquare size={16} className='text-gray-400 mt-1' />
                                                <p className='text-gray-600 leading-relaxed text-sm whitespace-pre-wrap'>{item.message}</p>
                                            </div>
                                            
                                            {item.orderId && (
                                                <div className='mt-4 flex items-center gap-2 bg-gray-50 w-fit px-3 py-1 rounded-md border border-gray-100'>
                                                    <span className='text-[10px] font-bold text-gray-400 uppercase tracking-tighter'>Order ID</span>
                                                    <span className='text-xs font-mono text-gray-700 bg-white px-1.5 rounded border shadow-sm'>#{item.orderId}</span>
                                                </div>
                                            )}
                                        </div>

                                        {item.image && (
                                            <div className='relative group'>
                                                <p className='text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5'>
                                                    <ImageIcon size={12} /> Supporting Image
                                                </p>
                                                <div className='aspect-square rounded-xl overflow-hidden border border-gray-100 shadow-sm'>
                                                    <img 
                                                        src={item.image} 
                                                        className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 cursor-zoom-in' 
                                                        alt="Ticket inquiry" 
                                                        onClick={() => window.open(item.image, '_blank')}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    
                                    {item.status?.toLowerCase() === 'pending' && (
                                        <div className='mt-8 pt-6 border-t border-gray-50 flex items-center text-xs text-gray-400 italic'>
                                            <div className='w-2 h-2 bg-orange-400 rounded-full mr-2 animate-pulse'></div>
                                            Our agents are currently reviewing your request. We'll update you shortly.
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            
            <div className='max-w-5xl mx-auto mt-8 mb-16 px-4'>
                <div className='bg-black text-white p-6 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-2xl'>
                    <div>
                        <h4 className='text-lg font-bold prata-regular mb-1'>Need more help?</h4>
                        <p className='text-gray-400 text-xs'>Our AI assistant and support agents are here for you 24/7.</p>
                    </div>
                    <button onClick={() => navigate('/contact')} className='bg-white text-black px-6 py-2.5 rounded-full font-bold text-xs hover:bg-gray-100 transition-colors shadow-lg'>
                        Contact Support
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Support
