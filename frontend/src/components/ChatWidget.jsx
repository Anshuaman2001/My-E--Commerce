import React, { useState, useEffect, useRef, useContext } from 'react'
import { ShopContext } from '../context/ShopContext'
import axios from 'axios'
import {
  Send, Bot, Package, RotateCcw, AlertTriangle, X,
  Minus, Camera, Trash2, ImageIcon, CheckCircle2,
  ChevronRight, ShoppingBag, ArrowLeft, Loader2, Star
} from 'lucide-react'
import { toast } from 'react-toastify'

// ─── Complaint flow steps ─────────────────────────────────────────────────────
// 'idle'         → Normal AI chat
// 'pick_order'   → Show user's orders to pick from
// 'pick_product' → Show items from the selected order
// 'write'        → User types their complaint + attaches images
// 'done'         → Ticket created confirmation

const WELCOME = (name) =>
  `Hi ${name || 'there'}! 👋 I'm your **Forever AI Assistant**. I can help you track orders, answer questions, and file complaints. How can I help you today?`

const ChatWidget = () => {
  const { token, backendUrl, userData, navigate } = useContext(ShopContext)

  const [isOpen, setIsOpen] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [messages, setMessages] = useState(() => {
    const saved = sessionStorage.getItem('forever_chat_v2')
    return saved
      ? JSON.parse(saved)
      : [{ text: WELCOME(userData?.name), isBot: true }]
  })
  const [input, setInput] = useState('')

  // Complaint wizard state
  const [flow, setFlow] = useState('idle') // 'idle' | 'pick_order' | 'pick_product' | 'write' | 'done'
  const [orders, setOrders] = useState([])
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [complaintImages, setComplaintImages] = useState([]) // array of File objects
  const [complaintText, setComplaintText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loadingOrders, setLoadingOrders] = useState(false)

  const fileInputRef = useRef(null)
  const messagesEndRef = useRef(null)
  const widgetRef = useRef(null)
  const inputRef = useRef(null)

  // ── Persist chat ──────────────────────────────────────────────────────────
  useEffect(() => {
    sessionStorage.setItem('forever_chat_v2', JSON.stringify(messages))
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ── Click outside to close ────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (isOpen && widgetRef.current && !widgetRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    if (isOpen) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [isOpen])

  // ── Auto focus input when opening ─────────────────────────────────────────
  useEffect(() => {
    if (isOpen && flow === 'idle') {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen, flow])

  // ── Helpers ───────────────────────────────────────────────────────────────
  const pushBot = (text) =>
    setMessages(prev => [...prev, { text, isBot: true }])

  const pushUser = (text) =>
    setMessages(prev => [...prev, { text, isBot: false }])

  const endChat = () => {
    setMessages([{ text: WELCOME(userData?.name), isBot: true }])
    sessionStorage.removeItem('forever_chat_v2')
    setFlow('idle')
    setSelectedOrder(null)
    setSelectedProduct(null)
    setComplaintImages([])
    setComplaintText('')
    toast.success('Chat reset!')
  }

  // ── Fetch orders for complaint wizard ─────────────────────────────────────
  const fetchOrders = async () => {
    if (!token) {
      pushBot("Please **login** first to file a complaint.")
      return
    }
    setLoadingOrders(true)
    try {
      const res = await axios.post(backendUrl + '/api/order/userorders', {}, { headers: { token } })
      if (res.data.success && res.data.orders?.length > 0) {
        // Sort newest first
        const sorted = [...res.data.orders].sort((a, b) => b.date - a.date)
        setOrders(sorted)
        setFlow('pick_order')
        pushBot("📦 Please select the **order** you'd like to raise a complaint about:")
      } else {
        pushBot("It looks like you don't have any orders yet. Once you place an order, you can file a product-specific complaint here.")
      }
    } catch (err) {
      console.error(err)
      pushBot("Sorry, I couldn't fetch your orders right now. Please try again.")
    } finally {
      setLoadingOrders(false)
    }
  }

  // ── Start complaint flow ───────────────────────────────────────────────────
  const startComplaintFlow = () => {
    pushUser("I want to file a complaint")
    fetchOrders()
  }

  // ── Order selected ────────────────────────────────────────────────────────
  const handleOrderSelect = (order) => {
    setSelectedOrder(order)
    setFlow('pick_product')
    pushUser(`Order #${String(order._id).slice(-6).toUpperCase()}`)
    pushBot(`Great! Now select the **product** from that order that you have an issue with:`)
  }

  // ── Product selected ──────────────────────────────────────────────────────
  const handleProductSelect = (item) => {
    setSelectedProduct(item)
    setFlow('write')
    pushUser(item.name)
    pushBot(`Got it — you're raising a complaint about **${item.name}**. 📸 You can attach up to 3 photos and describe the issue below. When ready, hit **Submit Complaint**.`)
  }

  // ── Submit complaint ticket ───────────────────────────────────────────────
  const submitComplaint = async () => {
    if (!complaintText.trim()) {
      toast.error('Please describe your issue before submitting.')
      return
    }
    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append('subject', `Complaint: ${selectedProduct?.name || 'Product Issue'}`)
      formData.append('message', complaintText.trim())
      formData.append('orderId', selectedOrder?._id || '')
      formData.append('productName', selectedProduct?.name || '')

      // Attach up to 3 images
      complaintImages.slice(0, 3).forEach((file, i) => {
        formData.append('images', file)
      })

      const res = await axios.post(backendUrl + '/api/chat/ticket', formData, {
        headers: { token }
      })

      if (res.data.success) {
        const tid = String(res.data.ticketId).slice(-8).toUpperCase()
        const now = new Date()
        pushUser(complaintText.trim())
        pushBot(`✅ Your complaint has been submitted successfully!\n\n🎫 **Ticket ID:** #${tid}\n📅 **Filed on:** ${now.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} at ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}\n\nOur support team will review it within 24 hours. You can track its status in the **Support** section.`)
        setFlow('done')
        setComplaintImages([])
        setComplaintText('')
        setSelectedOrder(null)
        setSelectedProduct(null)
      } else {
        toast.error(res.data.message || 'Failed to submit. Please try again.')
      }
    } catch (err) {
      console.error(err)
      toast.error('Network error. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // ── Cancel complaint wizard ───────────────────────────────────────────────
  const cancelComplaint = () => {
    setFlow('idle')
    setSelectedOrder(null)
    setSelectedProduct(null)
    setComplaintImages([])
    setComplaintText('')
    pushBot("No problem! I've cancelled the complaint. Is there anything else I can help you with?")
  }

  // ── Normal AI chat send ───────────────────────────────────────────────────
  const handleSend = async (e, customMsg = null) => {
    if (e) e.preventDefault()
    const msgText = (customMsg || input).trim()
    if (!msgText) return

    if (!token) {
      setMessages(prev => [
        ...prev,
        { text: msgText, isBot: false },
        { text: "Please **login** to chat with our AI assistant and track your orders.", isBot: true }
      ])
      setInput('')
      return
    }

    pushUser(msgText)
    setInput('')
    setIsTyping(true)

    try {
      const res = await axios.post(
        backendUrl + '/api/chat/message',
        { message: msgText, history: messages },
        { headers: { token } }
      )

      if (res.data.success) {
        // Check if AI is suggesting a complaint flow
        if (res.data.suggestComplaint) {
          pushBot(res.data.reply)
          // Short delay then auto-fetch orders
          setTimeout(() => fetchOrders(), 800)
        } else {
          pushBot(res.data.reply)
        }
      } else {
        pushBot("Sorry, I'm having trouble right now. Please try again.")
      }
    } catch (err) {
      console.error(err)
      pushBot("Sorry, I'm having trouble connecting. Please try again later.")
    } finally {
      setIsTyping(false)
    }
  }

  // ── Image attachment ──────────────────────────────────────────────────────
  const handleImagePick = (e) => {
    const files = Array.from(e.target.files)
    if (complaintImages.length + files.length > 3) {
      toast.warning('You can attach a maximum of 3 photos.')
      return
    }
    setComplaintImages(prev => [...prev, ...files].slice(0, 3))
    toast.success(`${files.length} photo${files.length > 1 ? 's' : ''} attached!`)
    e.target.value = '' // reset input so same file can be re-selected
  }

  const removeImage = (idx) => {
    setComplaintImages(prev => prev.filter((_, i) => i !== idx))
  }

  // ── Quick action chips ────────────────────────────────────────────────────
  const quickActions = [
    {
      label: 'Track Order',
      icon: <Package size={14} />,
      text: 'Where is my last order? Give me the full status.'
    },
    {
      label: 'Return Policy',
      icon: <RotateCcw size={14} />,
      text: 'What is your return and refund policy?'
    },
    {
      label: 'File Complaint',
      icon: <AlertTriangle size={14} />,
      action: startComplaintFlow
    },
    {
      label: 'My Orders',
      icon: <ShoppingBag size={14} />,
      text: 'Show me a summary of my recent orders.'
    }
  ]

  // ── Render message text with basic markdown-like bold ────────────────────
  const renderText = (text) => {
    const parts = text.split(/\*\*(.*?)\*\*/g)
    return parts.map((part, i) =>
      i % 2 === 1 ? <strong key={i}>{part}</strong> : part
    )
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div ref={widgetRef} className="fixed bottom-8 right-4 sm:right-24 z-[9999] font-sans pointer-events-none">

      {/* ── Chat Window ─────────────────────────────────────────────────── */}
      {isOpen && (
        <div className="absolute bottom-0 right-0 w-[calc(100vw-2rem)] xs:w-[360px] sm:w-[410px] h-[580px] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden pointer-events-auto"
          style={{ animation: 'slideUpFade 0.25s ease-out' }}>

          {/* ── Header ────────────────────────────────────────────────── */}
          <div className="bg-gradient-to-r from-gray-900 to-black text-white px-5 py-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-9 h-9 bg-white/15 rounded-full flex items-center justify-center">
                  <Bot size={18} className="text-white" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-black animate-pulse" />
              </div>
              <div>
                <p className="text-sm font-bold prata-regular tracking-wide">Forever AI Support</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest">
                  {flow !== 'idle' && flow !== 'done' ? '● Filing Complaint' : '● Online'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {flow !== 'idle' && flow !== 'done' && (
                <button
                  onClick={cancelComplaint}
                  title="Cancel complaint"
                  className="flex items-center gap-1 text-[11px] text-orange-300 hover:text-orange-200 px-2 py-1 rounded-lg hover:bg-white/10 transition-colors mr-1"
                >
                  <ArrowLeft size={13} /> Cancel
                </button>
              )}
              <button onClick={() => setIsOpen(false)} title="Minimize" className="p-1.5 hover:bg-white/10 rounded-full transition-colors">
                <Minus size={18} />
              </button>
              <button onClick={endChat} title="Clear chat" className="p-1.5 hover:bg-white/10 rounded-full transition-colors text-red-300 hover:text-red-200">
                <Trash2 size={18} />
              </button>
            </div>
          </div>

          {/* ── Messages ──────────────────────────────────────────────── */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-gray-50/60 custom-scroll">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex gap-2 ${msg.isBot ? 'justify-start' : 'justify-end'}`}>
                {msg.isBot && (
                  <div className="w-7 h-7 rounded-full bg-black flex items-center justify-center shrink-0 mt-0.5">
                    <Bot size={14} className="text-white" />
                  </div>
                )}
                <div className={`max-w-[78%] px-4 py-3 rounded-2xl text-[13px] leading-relaxed shadow-sm ${
                  msg.isBot
                    ? 'bg-white text-gray-700 rounded-tl-none border border-gray-100'
                    : 'bg-black text-white rounded-tr-none'
                }`}>
                  <span className="whitespace-pre-line">{renderText(msg.text)}</span>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex gap-2 justify-start">
                <div className="w-7 h-7 rounded-full bg-black flex items-center justify-center shrink-0">
                  <Bot size={14} className="text-white" />
                </div>
                <div className="bg-white border border-gray-100 px-4 py-3 rounded-2xl rounded-tl-none flex gap-1 items-center shadow-sm">
                  <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.15s]" />
                  <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.3s]" />
                </div>
              </div>
            )}

            {/* Loading orders spinner */}
            {loadingOrders && (
              <div className="flex justify-center py-3">
                <Loader2 size={20} className="animate-spin text-gray-400" />
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* ── Complaint Wizard Panels ────────────────────────────────── */}

          {/* STEP 1: Pick Order */}
          {flow === 'pick_order' && orders.length > 0 && (
            <div className="bg-white border-t border-gray-100 px-4 py-3 max-h-52 overflow-y-auto custom-scroll shrink-0">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Select Order</p>
              <div className="space-y-2">
                {orders.map(order => (
                  <button
                    key={order._id}
                    onClick={() => handleOrderSelect(order)}
                    className="w-full text-left bg-gray-50 hover:bg-orange-50 border border-gray-200 hover:border-orange-300 rounded-xl px-3 py-2.5 transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-gray-800">
                          Order #{String(order._id).slice(-6).toUpperCase()}
                        </p>
                        <p className="text-[11px] text-gray-500 mt-0.5">
                          {order.items?.slice(0,2).map(i => i.name).join(', ')}
                          {order.items?.length > 2 ? ` +${order.items.length - 2} more` : ''}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                            order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                            order.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>{order.status}</span>
                          <span className="text-[10px] text-gray-400">
                            {new Date(order.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          </span>
                        </div>
                      </div>
                      <ChevronRight size={14} className="text-gray-400 group-hover:text-orange-500 transition-colors" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: Pick Product */}
          {flow === 'pick_product' && selectedOrder && (
            <div className="bg-white border-t border-gray-100 px-4 py-3 max-h-52 overflow-y-auto custom-scroll shrink-0">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Select Product</p>
              <div className="space-y-2">
                {selectedOrder.items?.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleProductSelect(item)}
                    className="w-full text-left bg-gray-50 hover:bg-orange-50 border border-gray-200 hover:border-orange-300 rounded-xl px-3 py-2.5 transition-all group flex items-center gap-3"
                  >
                    {item.image?.[0] ? (
                      <img src={item.image[0]} alt={item.name} className="w-10 h-10 object-cover rounded-lg border border-gray-200 shrink-0" />
                    ) : (
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                        <ShoppingBag size={14} className="text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-800 truncate">{item.name}</p>
                      <p className="text-[11px] text-gray-500">Size: {item.size} · Qty: {item.quantity}</p>
                    </div>
                    <ChevronRight size={14} className="text-gray-400 group-hover:text-orange-500 transition-colors shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: Write Complaint */}
          {flow === 'write' && (
            <div className="bg-white border-t border-gray-100 px-4 py-3 shrink-0">
              {/* Selected product pill */}
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Complaint for:</span>
                <span className="bg-orange-50 border border-orange-200 text-orange-700 text-[11px] font-semibold px-2 py-0.5 rounded-full truncate max-w-[160px]">
                  {selectedProduct?.name}
                </span>
              </div>

              {/* Image thumbnails */}
              {complaintImages.length > 0 && (
                <div className="flex gap-2 mb-2 flex-wrap">
                  {complaintImages.map((file, i) => (
                    <div key={i} className="relative w-12 h-12 rounded-lg overflow-hidden border border-gray-200">
                      <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                      <button
                        onClick={() => removeImage(i)}
                        className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center"
                      >
                        <X size={8} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Textarea + controls */}
              <div className="flex gap-2 items-end">
                <textarea
                  value={complaintText}
                  onChange={e => setComplaintText(e.target.value)}
                  placeholder="Describe your issue in detail..."
                  rows={3}
                  className="flex-1 text-sm bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-orange-400 resize-none transition-colors"
                />
                <div className="flex flex-col gap-2">
                  {/* Camera button */}
                  <input type="file" hidden ref={fileInputRef} accept="image/*" multiple onChange={handleImagePick} />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={complaintImages.length >= 3}
                    className={`p-2.5 rounded-xl transition-colors ${complaintImages.length >= 3 ? 'bg-gray-100 text-gray-300' : 'bg-gray-100 text-gray-600 hover:bg-orange-100 hover:text-orange-600'}`}
                    title={complaintImages.length >= 3 ? 'Max 3 photos' : 'Attach photo'}
                  >
                    <Camera size={16} />
                  </button>
                  {/* Submit button */}
                  <button
                    type="button"
                    onClick={submitComplaint}
                    disabled={isSubmitting || !complaintText.trim()}
                    className="p-2.5 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Submit complaint"
                  >
                    {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  </button>
                </div>
              </div>
              <p className="text-[10px] text-gray-400 mt-1.5">{complaintImages.length}/3 photos attached</p>
            </div>
          )}

          {/* STEP 4: Done — offer new action */}
          {flow === 'done' && (
            <div className="bg-white border-t border-gray-100 px-4 py-3 shrink-0">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle2 size={16} />
                  <span className="text-xs font-semibold">Complaint submitted</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setFlow('idle'); pushBot("What else can I help you with?") }}
                    className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors font-medium"
                  >
                    Continue Chat
                  </button>
                  <button
                    onClick={() => { navigate('/support'); setIsOpen(false) }}
                    className="text-xs bg-black text-white hover:bg-gray-800 px-3 py-1.5 rounded-lg transition-colors font-medium"
                  >
                    View Tickets
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── Quick Actions (only in idle, first few messages) ───────── */}
          {flow === 'idle' && messages.length < 5 && (
            <div className="px-4 py-2 flex gap-2 overflow-x-auto scrollbar-hide bg-white/80 border-t border-gray-100 shrink-0">
              {quickActions.map((action, idx) => (
                <button
                  key={idx}
                  onClick={() => action.action ? action.action() : handleSend(null, action.text)}
                  className="flex items-center gap-1.5 whitespace-nowrap bg-white border border-gray-200 hover:border-black hover:text-black px-3 py-1.5 rounded-full text-[11px] font-medium text-gray-600 transition-all shadow-sm shrink-0"
                >
                  {action.icon}
                  {action.label}
                </button>
              ))}
            </div>
          )}

          {/* ── Normal Text Input (only in idle / done) ────────────────── */}
          {(flow === 'idle' || flow === 'done') && (
            <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-100 flex items-center gap-2 shrink-0">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask about orders, returns, products..."
                className="flex-1 pl-4 pr-3 py-2.5 bg-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-black/10 transition-all"
              />
              <button
                type="submit"
                disabled={!input.trim() || isTyping}
                className="p-2.5 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-40 shadow-md"
              >
                {isTyping ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              </button>
            </form>
          )}

          <div className="bg-white px-4 pb-2.5 text-[10px] text-center text-gray-400">
            Powered by Forever AI • Premium Support
          </div>
        </div>
      )}

      {/* ── Hidden toggle button (for ActionHub) ──────────────────────── */}
      <button
        id="chat-widget-trigger"
        className="hidden"
        onClick={() => setIsOpen(prev => !prev)}
        aria-hidden="true"
      />

      <style>{`
        @keyframes slideUpFade {
          from { opacity: 0; transform: translateY(16px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  )
}

export default ChatWidget
