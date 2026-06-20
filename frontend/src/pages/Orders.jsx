import React, { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from '../components/Title';
import axios from 'axios';
import CancelModal from '../components/CancelModal';
import TrackingModal from '../components/TrackingModal';
import { AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, Package } from 'lucide-react';

const statusDot = {
  'Order Placed': 'bg-blue-500',
  'Packing': 'bg-yellow-500',
  'Shipped': 'bg-purple-500',
  'Out for delivery': 'bg-orange-500',
  'Delivered': 'bg-emerald-500',
  'Cancelled': 'bg-red-500',
};

const Orders = () => {
  const { backendUrl, token, currency } = useContext(ShopContext);
  const navigate = useNavigate();

  const [orderData, setOrderData] = useState([]);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [trackItem, setTrackItem] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const pollingRef = useRef(null);
  const trackItemIdRef = useRef(null);
  const trackItemKeyRef = useRef(null); // orderId+name key for matching

  const loadOrderData = useCallback(async (silent = false) => {
    try {
      if (!token) return null;
      if (!silent) setRefreshing(true);

      const response = await axios.post(backendUrl + '/api/order/userorders', {}, { headers: { token } });
      if (response.data.success) {
        let allOrdersItem = [];
        response.data.orders.forEach((order) => {
          order.items.forEach((item) => {
            item['orderId'] = order._id;
            item['status'] = order.status;
            item['payment'] = order.payment;
            item['paymentMethod'] = order.paymentMethod;
            item['date'] = order.date;
            item['packedAt'] = order.packedAt;
            item['shippedAt'] = order.shippedAt;
            item['outForDeliveryAt'] = order.outForDeliveryAt;
            item['deliveredAt'] = order.deliveredAt;
            item['cancelledAt'] = order.cancelledAt;
            item['cancelReason'] = order.cancelReason;
            item['deliveryPartner'] = order.deliveryPartner;
            // pin is stored on the item itself
            allOrdersItem.push(item);
          });
        });
        const reversed = allOrdersItem.reverse();
        setOrderData(reversed);

        // If user is tracking an order, update the trackItem too
        if (trackItemKeyRef.current) {
          const { orderId, name, size } = trackItemKeyRef.current;
          const updated = reversed.find(i => i.orderId === orderId && i.name === name && i.size === size);
          if (updated) setTrackItem(updated);
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      setRefreshing(false);
    }
  }, [token, backendUrl]);

  const cancelOrder = (orderId) => {
    setSelectedOrderId(orderId);
    setShowCancelModal(true);
  };

  const handleCancelConfirm = async (orderId, cancelReason) => {
    try {
      const response = await axios.post(backendUrl + '/api/order/cancel', { orderId, cancelReason }, { headers: { token } });
      if (response.data.success) {
        setShowCancelModal(false);
        loadOrderData();
      }
    } catch (error) {
      console.log(error);
    }
  };

  // When user opens tracking modal, store ref for live updates
  const handleTrackItem = (item) => {
    setTrackItem(item);
    trackItemIdRef.current = item;
    trackItemKeyRef.current = { orderId: item.orderId, name: item.name, size: item.size };
  };

  const handleCloseTracking = () => {
    setTrackItem(null);
    trackItemIdRef.current = null;
    trackItemKeyRef.current = null;
  };

  useEffect(() => {
    loadOrderData();
  }, [token]);  // eslint-disable-line

  // Live polling every 30 seconds (separate from tracking modal's own refresh)
  useEffect(() => {
    if (!token) return;
    pollingRef.current = setInterval(() => {
      loadOrderData(true); // silent refresh
    }, 30000);
    return () => clearInterval(pollingRef.current);
  }, [token]); // eslint-disable-line

  // Stable refresh callback for TrackingModal
  const handleRefreshForModal = useCallback(() => loadOrderData(true), [loadOrderData]);

  return (
    <div className='border-t pt-16'>
      <div className='flex items-center justify-between mb-6'>
        <div className='text-2xl'>
          <Title text1={'MY'} text2={'ORDERS'} />
        </div>
        <button
          onClick={() => loadOrderData()}
          className={`flex items-center gap-1.5 text-xs border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors text-gray-500 ${refreshing ? 'opacity-60' : ''}`}
          disabled={refreshing}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div>
        {orderData.length === 0
          ? (
            <div className='flex flex-col items-center justify-center my-20'>
              <Package className='w-16 h-16 text-gray-200 mb-4' />
              <p className='text-xl text-gray-400'>You have no orders yet</p>
              <button
                onClick={() => navigate('/collection')}
                className='bg-black text-white text-sm my-8 px-8 py-3 mt-4 hover:bg-gray-800 transition-colors'
              >
                EXPLORE PRODUCTS
              </button>
            </div>
          )
          : orderData.map((item, index) => (
            <div key={index} className='py-4 border-t border-b text-gray-700 flex flex-col md:flex-row md:items-center md:justify-between gap-4 hover:bg-gray-50/50 px-1 transition-colors'>
              <div className='flex items-start gap-6 text-sm'>
                <img className='w-16 sm:w-20 object-cover rounded-md' src={item.image[0]} alt='' />
                <div>
                  <p className='sm:text-base font-medium'>{item.name}</p>
                  <div className='flex items-center gap-3 mt-1 text-base text-gray-700'>
                    <p>{currency}{item.price}</p>
                    <p className='text-sm text-gray-400'>Qty: {item.quantity}</p>
                    <p className='text-sm text-gray-400'>Size: {item.size}</p>
                  </div>
                  <p className='mt-1 text-xs text-gray-400'>Date: {new Date(item.date).toDateString()}</p>
                  <p className='mt-0.5 text-xs text-gray-400'>Payment: {item.paymentMethod}</p>
                  {/* Show delivery partner summary if assigned */}
                  {item.deliveryPartner?.name && (
                    <div className='mt-2 flex items-center gap-2 text-xs text-gray-500'>
                      <div className='w-5 h-5 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-[9px]'>
                        {item.deliveryPartner.avatarSeed || item.deliveryPartner.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className='font-medium text-gray-700'>{item.deliveryPartner.name}</span>
                      <span className='text-gray-300'>·</span>
                      <span>{item.deliveryPartner.company}</span>
                    </div>
                  )}
                  <div className='mt-2 flex items-center gap-2'>
                    <span className='text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded font-mono'>Order ID:</span>
                    <span className='text-xs font-mono font-bold text-gray-700 bg-orange-50 border border-orange-100 px-2 py-0.5 rounded select-all'>{item.orderId}</span>
                  </div>
                </div>
              </div>
              <div className='md:w-1/2 flex justify-between'>
                <div className='flex items-center gap-2'>
                  <span className={`w-2 h-2 rounded-full ${statusDot[item.status] || 'bg-gray-400'}`}></span>
                  <p className='text-sm md:text-base'>{item.status}</p>
                </div>
                <div className='flex items-center gap-4'>
                  <button
                    onClick={() => handleTrackItem(item)}
                    className='border border-orange-200 text-orange-600 hover:bg-orange-50 px-4 py-2 text-sm font-medium rounded-sm transition-colors'
                  >
                    Track Order
                  </button>
                  {(item.status === 'Order Placed' || item.status === 'Packing') && (
                    <button
                      onClick={() => cancelOrder(item.orderId)}
                      className='border px-4 py-2 text-sm font-medium rounded-sm text-red-500 hover:bg-red-50'
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        }
      </div>

      {showCancelModal && (
        <CancelModal
          orderId={selectedOrderId}
          onClose={() => setShowCancelModal(false)}
          onConfirm={handleCancelConfirm}
        />
      )}

      <AnimatePresence>
        {trackItem && (
          <TrackingModal
            item={trackItem}
            onClose={handleCloseTracking}
            onRefresh={handleRefreshForModal}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Orders;