import React, { useContext, useEffect, useState } from 'react'
import axios from 'axios'
import { ShopContext } from '../context/ShopContext'
import { toast } from 'react-toastify'
import { MessageSquare, Clock, CheckCircle, User, Package, ShoppingBag, X } from 'lucide-react'

const STATUS_STYLES = {
  Pending: 'bg-orange-50 border-orange-200 text-orange-600',
  'In Progress': 'bg-blue-50 border-blue-200 text-blue-600',
  Resolved: 'bg-green-50 border-green-200 text-green-600 opacity-60 cursor-not-allowed'
}

const AdminTickets = () => {
  const { backendUrl, token } = useContext(ShopContext)
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [lightbox, setLightbox] = useState(null)

  const fetchTickets = async () => {
    try {
      const response = await axios.post(backendUrl + '/api/chat/tickets/list', {}, { headers: { token } })
      if (response.data.success) {
        setTickets(response.data.tickets)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const updateTicketStatus = async (id, status) => {
    try {
      const response = await axios.post(backendUrl + '/api/chat/tickets/status', { ticketId: id, status }, { headers: { token } })
      if (response.data.success) {
        toast.success('Status updated')
        fetchTickets()
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  useEffect(() => { fetchTickets() }, [token])

  return (
    <div className="w-full pb-12">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold prata-regular">Customer Support Tickets</h1>
        <p className="text-sm text-gray-500 mt-1">Review and manage incoming support requests and complaints.</p>
      </div>

      <div className="flex flex-col gap-4">
        {loading ? (
          <p className="text-gray-400 text-center py-10">Loading tickets...</p>
        ) : tickets.length === 0 ? (
          <div className="text-center py-20 bg-white border rounded-2xl">
            <MessageSquare size={48} className="mx-auto text-gray-200 mb-4" />
            <p className="text-gray-400 font-medium">No support tickets yet.</p>
          </div>
        ) : (
          tickets.map((ticket) => {
            // Support both old (single image) and new (images array) schema
            const allImages = ticket.images?.length > 0
              ? ticket.images
              : ticket.image ? [ticket.image] : []

            return (
              <div key={ticket._id} className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-md transition-shadow">
                {/* Header row */}
                <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
                      <User size={18} className="text-gray-500" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{ticket.subject}</p>
                      <p className="text-[10px] font-mono text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded w-fit mt-0.5">
                        #{String(ticket._id).slice(-8).toUpperCase()}
                      </p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {new Date(ticket.date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}
                        {' '}at {new Date(ticket.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>

                  <select
                    value={ticket.status}
                    onChange={(e) => updateTicketStatus(ticket._id, e.target.value)}
                    disabled={ticket.status === 'Resolved'}
                    className={`text-xs font-bold px-3 py-1.5 rounded-full border outline-none ${STATUS_STYLES[ticket.status] || STATUS_STYLES['Pending']}`}
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>

                {/* Product & Order info */}
                {(ticket.productName || (ticket.orderId && ticket.orderId !== 'General')) && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {ticket.productName && (
                      <span className="inline-flex items-center gap-1.5 text-[11px] bg-purple-50 text-purple-700 border border-purple-200 px-2.5 py-1 rounded-full font-semibold">
                        <ShoppingBag size={11} />
                        {ticket.productName}
                      </span>
                    )}
                    {ticket.orderId && ticket.orderId !== 'General' && (
                      <span className="inline-flex items-center gap-1.5 text-[11px] bg-gray-50 text-gray-600 border border-gray-200 px-2.5 py-1 rounded-full font-semibold">
                        <Package size={11} />
                        Order #{String(ticket.orderId).slice(-6).toUpperCase()}
                      </span>
                    )}
                  </div>
                )}

                {/* Message */}
                <p className="text-sm text-gray-700 leading-relaxed mb-4 bg-gray-50 rounded-xl p-3 border border-gray-100">
                  {ticket.message}
                </p>

                {/* Attached images */}
                {allImages.length > 0 && (
                  <div className="mb-4">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                      Attached Photos ({allImages.length})
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {allImages.map((url, i) => (
                        <div
                          key={i}
                          onClick={() => setLightbox(url)}
                          className="w-16 h-16 rounded-xl overflow-hidden border border-gray-200 cursor-zoom-in hover:opacity-90 transition-opacity"
                        >
                          <img src={url} alt={`Attachment ${i + 1}`} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center gap-4 pt-3 border-t border-gray-100 text-[11px] text-gray-400">
                  <span>User ID: <span className="font-mono">{String(ticket.userId).slice(-8)}</span></span>
                  <span className={`ml-auto font-bold ${ticket.status === 'Resolved' ? 'text-green-500' : ticket.status === 'In Progress' ? 'text-blue-500' : 'text-orange-500'}`}>
                    ● {ticket.status}
                  </span>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[4000] bg-black/90 flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setLightbox(null)}
        >
          <button
            onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors"
          >
            <X size={22} />
          </button>
          <img
            src={lightbox}
            alt="Attachment preview"
            className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl"
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  )
}

export default AdminTickets
