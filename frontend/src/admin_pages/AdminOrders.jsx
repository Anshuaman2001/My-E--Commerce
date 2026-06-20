import React, { useContext, useEffect, useState } from 'react'
import axios from 'axios'
import { ShopContext } from '../context/ShopContext'
import { toast } from 'react-toastify'
import { Package, ChevronDown, User, Phone, Truck, Star, Edit2, Check, X } from 'lucide-react'

const COMPANIES = ['BlueDart', 'Delhivery', 'Shadowfax', 'Ekart', 'DTDC', 'XpressBees'];

const statusColors = {
  'Order Placed': 'bg-blue-50 text-blue-700 border-blue-200',
  'Packing': 'bg-yellow-50 text-yellow-700 border-yellow-200',
  'Shipped': 'bg-purple-50 text-purple-700 border-purple-200',
  'Out for delivery': 'bg-orange-50 text-orange-700 border-orange-200',
  'Delivered': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Cancelled': 'bg-red-50 text-red-600 border-red-200',
};

const PartnerEditPanel = ({ order, backendUrl, token, onSaved }) => {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: order.deliveryPartner?.name || '',
    phone: order.deliveryPartner?.phone || '',
    vehicle: order.deliveryPartner?.vehicle || '',
    company: order.deliveryPartner?.company || 'BlueDart',
    rating: order.deliveryPartner?.rating || '4.8',
    avatarSeed: order.deliveryPartner?.avatarSeed || '',
  });

  useEffect(() => {
    setForm({
      name: order.deliveryPartner?.name || '',
      phone: order.deliveryPartner?.phone || '',
      vehicle: order.deliveryPartner?.vehicle || '',
      company: order.deliveryPartner?.company || 'BlueDart',
      rating: order.deliveryPartner?.rating || '4.8',
      avatarSeed: order.deliveryPartner?.avatarSeed || '',
    });
  }, [order]);

  const handleSave = async () => {
    const avatarSeed = form.name.split(' ').map(n => n[0]).join('').toUpperCase();
    const partner = { ...form, avatarSeed };
    try {
      const res = await axios.post(
        backendUrl + '/api/order/delivery-partner',
        { orderId: order._id, deliveryPartner: partner },
        { headers: { token } }
      );
      if (res.data.success) {
        toast.success('Delivery partner updated!');
        setEditing(false);
        onSaved();
      } else {
        toast.error(res.data.message);
      }
    } catch (e) {
      toast.error(e.message);
    }
  };

  const showPartner = ['Shipped', 'Out for delivery', 'Delivered'].includes(order.status);
  if (!showPartner) return null;

  const hasPartner = order.deliveryPartner?.name;

  return (
    <div className="mt-3 border-t border-gray-100 pt-3">
      {!editing ? (
        <div className="flex items-center justify-between">
          {hasPartner ? (
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <div className="w-7 h-7 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-[10px]">
                {order.deliveryPartner.avatarSeed || order.deliveryPartner.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <p className="font-semibold text-gray-800">{order.deliveryPartner.name}</p>
                <p className="text-gray-400">{order.deliveryPartner.company} · {order.deliveryPartner.phone}</p>
              </div>
            </div>
          ) : (
            <p className="text-xs text-gray-400 italic">No delivery partner assigned yet</p>
          )}
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-1 text-xs text-orange-500 hover:text-orange-700 border border-orange-200 hover:border-orange-400 px-2 py-1 rounded transition-colors"
          >
            <Edit2 className="w-3 h-3" /> {hasPartner ? 'Edit' : 'Assign'}
          </button>
        </div>
      ) : (
        <div className="bg-orange-50 border border-orange-100 rounded-lg p-3 space-y-2">
          <p className="text-xs font-bold text-orange-700 mb-2 flex items-center gap-1"><User className="w-3 h-3" /> Delivery Partner Details</p>
          <div className="grid grid-cols-2 gap-2">
            <input
              value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              placeholder="Partner Name" className="border border-gray-200 rounded px-2 py-1 text-xs outline-none focus:border-orange-400"
            />
            <input
              value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
              placeholder="+91 XXXXX XXXXX" className="border border-gray-200 rounded px-2 py-1 text-xs outline-none focus:border-orange-400"
            />
            <input
              value={form.vehicle} onChange={e => setForm(p => ({ ...p, vehicle: e.target.value }))}
              placeholder="Vehicle No. (e.g. DL 3C AB 1234)" className="border border-gray-200 rounded px-2 py-1 text-xs outline-none focus:border-orange-400"
            />
            <select
              value={form.company} onChange={e => setForm(p => ({ ...p, company: e.target.value }))}
              className="border border-gray-200 rounded px-2 py-1 text-xs outline-none focus:border-orange-400 bg-white"
            >
              {COMPANIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input
              value={form.rating} onChange={e => setForm(p => ({ ...p, rating: e.target.value }))}
              placeholder="Rating (e.g. 4.8)" type="number" min="1" max="5" step="0.1"
              className="border border-gray-200 rounded px-2 py-1 text-xs outline-none focus:border-orange-400"
            />
          </div>
          <div className="flex gap-2 justify-end mt-2">
            <button onClick={() => setEditing(false)} className="flex items-center gap-1 text-xs text-gray-500 border px-2 py-1 rounded hover:bg-gray-100 transition-colors">
              <X className="w-3 h-3" /> Cancel
            </button>
            <button onClick={handleSave} className="flex items-center gap-1 text-xs text-white bg-orange-500 hover:bg-orange-600 px-3 py-1 rounded shadow transition-colors">
              <Check className="w-3 h-3" /> Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const AdminOrders = () => {
  const { backendUrl, token, currency } = useContext(ShopContext);
  const [orders, setOrders] = useState([]);

  const fetchAllOrders = async () => {
    if (!token) return;
    try {
      const response = await axios.post(backendUrl + '/api/order/list', {}, { headers: { token } });
      if (response.data.success) {
        setOrders(response.data.orders.reverse());
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const statusHandler = async (event, orderId) => {
    try {
      const response = await axios.post(
        backendUrl + '/api/order/status',
        { orderId, status: event.target.value },
        { headers: { token } }
      );
      if (response.data.success) {
        await fetchAllOrders();
        toast.success('Order status updated!');
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchAllOrders();
  }, [token]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="font-medium prata-regular text-2xl">Customer Orders</p>
        <button
          onClick={fetchAllOrders}
          className="flex items-center gap-2 text-xs border border-gray-200 px-3 py-1.5 rounded hover:bg-gray-50 transition-colors text-gray-600"
        >
          Refresh
        </button>
      </div>

      {orders.length === 0 && (
        <div className="text-center py-20 text-gray-400">No orders found.</div>
      )}

      <div className="space-y-4">
        {orders.map((order, index) => (
          <div
            key={index}
            className="bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden"
          >
            {/* Top strip: Order ID + Status badge */}
            <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <Package size={16} className="text-gray-400" />
                <span className="text-[11px] font-mono text-gray-500 select-all">{order._id}</span>
              </div>
              <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${statusColors[order.status] || 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                {order.status}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr] gap-4 p-5">
              {/* Items + address */}
              <div>
                <div className="mb-2">
                  {order.items.map((item, idx) => (
                    <p key={idx} className="text-sm font-medium text-gray-800 leading-relaxed">
                      {item.name} <span className="text-gray-400 font-normal">× {item.quantity}</span>
                      {item.size && <span className="ml-1 text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">{item.size}</span>}
                      {idx < order.items.length - 1 && <span className="text-gray-300">,</span>}
                    </p>
                  ))}
                </div>
                <p className="mt-2 font-semibold text-gray-900">{order.address.firstName} {order.address.lastName}</p>
                <p className="text-xs text-gray-500 mt-1">{order.address.street}, {order.address.city}, {order.address.state} {order.address.zipcode}</p>
                <p className="text-xs text-gray-500">{order.address.country}</p>
                <p className="text-xs font-medium text-gray-600 mt-1">📞 {order.address.phone}</p>
                {order.cancelReason && (
                  <div className="mt-2 p-2 bg-red-50 text-red-600 rounded-lg text-xs border border-red-100">
                    <strong>Cancellation:</strong> {order.cancelReason}
                  </div>
                )}
                {/* Delivery Partner sub-panel */}
                <PartnerEditPanel order={order} backendUrl={backendUrl} token={token} onSaved={fetchAllOrders} />
              </div>

              {/* Order meta */}
              <div className="text-xs space-y-1.5 text-gray-600">
                <p><span className="text-gray-400">Items:</span> {order.items.length}</p>
                <p><span className="text-gray-400">Method:</span> <span className="font-medium uppercase">{order.paymentMethod}</span></p>
                <p>
                  <span className="text-gray-400">Payment:</span>{' '}
                  <span className={`font-semibold ${order.payment ? 'text-emerald-600' : 'text-orange-500'}`}>
                    {order.payment ? '✓ Done' : '⏳ Pending'}
                  </span>
                </p>
                <p><span className="text-gray-400">Date:</span> {new Date(order.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                <p className="text-base font-bold text-gray-900 pt-1">{currency}{order.amount}</p>
              </div>

              {/* Status changer */}
              <div className="flex flex-col gap-2 justify-start">
                <label className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest">Update Status</label>
                <div className="relative">
                  <select
                    onChange={(event) => statusHandler(event, order._id)}
                    value={order.status}
                    disabled={order.status === 'Cancelled'}
                    className={`w-full appearance-none border rounded-lg px-3 py-2 pr-8 text-sm font-semibold outline-none transition-colors cursor-pointer
                      ${order.status === 'Cancelled'
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200'
                        : 'bg-white border-gray-200 hover:border-orange-300 focus:border-orange-400'
                      }`}
                  >
                    <option value="Order Placed">Order Placed</option>
                    <option value="Packing">Packing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Out for delivery">Out for delivery</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminOrders;
