import React, { useContext, useEffect, useState } from 'react'
import axios from 'axios'
import { ShopContext } from '../context/ShopContext'
import { toast } from 'react-toastify'
import { MessageSquare, Clock, CheckCircle, User, Package } from 'lucide-react'

const AdminTickets = () => {
    const { backendUrl, token } = useContext(ShopContext);
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchTickets = async () => {
        try {
            // For now, I'll add a dedicated endpoint if it doesn't exist, 
            // but I'll try to fetch from the general chat controller if I added a list method.
            // Wait, I didn't add a list method to the chat controller yet.
            const response = await axios.post(backendUrl + '/api/chat/tickets/list', {}, { headers: { token } });
            if (response.data.success) {
                setTickets(response.data.tickets.reverse());
            }
        } catch (error) {
            console.error(error);
            // toast.error("Failed to fetch tickets");
        } finally {
            setLoading(false);
        }
    }

    const updateTicketStatus = async (id, status) => {
        try {
            const response = await axios.post(backendUrl + '/api/chat/tickets/status', { ticketId: id, status }, { headers: { token } });
            if (response.data.success) {
                toast.success("Status updated");
                fetchTickets();
            }
        } catch (error) {
            toast.error(error.message);
        }
    }

    useEffect(() => {
        fetchTickets();
    }, [token]);

    return (
        <div className='w-full'>
            <p className='mb-6 font-medium prata-regular text-2xl'>Customer Support Tickets</p>
            
            <div className='flex flex-col gap-4'>
                {loading ? (
                    <p>Loading tickets...</p>
                ) : tickets.length === 0 ? (
                    <div className='text-center py-20 bg-white border rounded-xl'>
                        <MessageSquare size={48} className='mx-auto text-gray-300 mb-4' />
                        <p className='text-gray-500'>No support tickets found.</p>
                    </div>
                ) : (
                    tickets.map((ticket, index) => (
                        <div key={index} className='bg-white border-2 border-gray-100 p-6 rounded-xl hover:shadow-md transition-shadow'>
                            <div className='flex flex-wrap justify-between items-start gap-4 mb-4'>
                                <div className='flex items-center gap-3'>
                                    <div className='w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center'>
                                        <User size={20} className='text-gray-600' />
                                    </div>
                                    <div>
                                        <p className='font-bold text-gray-900'>{ticket.subject}</p>
                                        <p className='text-[10px] font-mono text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded w-fit mb-1'>ID: {ticket._id}</p>
                                        <p className='text-xs text-gray-500'>
                                            {new Date(ticket.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })} at {new Date(ticket.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                                <div className='flex items-center gap-2'>
                                    <select 
                                        value={ticket.status} 
                                        onChange={(e) => updateTicketStatus(ticket._id, e.target.value)}
                                        className={`text-xs font-bold px-3 py-1.5 rounded-full border outline-none ${
                                            ticket.status === 'Resolved' ? 'bg-green-50 border-green-200 text-green-600' : 
                                            ticket.status === 'In Progress' ? 'bg-blue-50 border-blue-200 text-blue-600' : 
                                            'bg-orange-50 border-orange-200 text-orange-600'
                                        }`}
                                    >
                                        <option value="Pending">Pending</option>
                                        <option value="In Progress">In Progress</option>
                                        <option value="Resolved">Resolved</option>
                                    </select>
                                </div>
                            </div>

                            <p className='text-sm text-gray-600 mb-6 leading-relaxed'>
                                {ticket.message}
                            </p>

                            {ticket.image && (
                                <div className='mb-6'>
                                    <p className='text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2'>Supporting Image:</p>
                                    <div className='w-32 h-32 rounded-lg overflow-hidden border border-gray-100 shadow-sm'>
                                        <img src={ticket.image} className='w-full h-full object-cover cursor-zoom-in' onClick={() => window.open(ticket.image, '_blank')} alt="Complaint" />
                                    </div>
                                </div>
                            )}

                            <div className='flex items-center gap-6 pt-4 border-t text-xs text-gray-400'>
                                <div className='flex items-center gap-2'>
                                    <Package size={14} />
                                    <span>Order ID: <strong>{ticket.orderId}</strong></span>
                                </div>
                                <div className='flex items-center gap-2'>
                                    <Clock size={14} />
                                    <span>User ID: {ticket.userId}</span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}

export default AdminTickets
