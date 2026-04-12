import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from '../components/Title';
import axios from 'axios';
import CancelModal from '../components/CancelModal';

const Orders = () => {

  const { backendUrl, token , currency } = useContext(ShopContext);

  const [orderData,setOrderData] = useState([])
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const loadOrderData = async () => {
    try {
      if (!token) {
        return null
      }

      const response = await axios.post(backendUrl + '/api/order/userorders',{},{headers:{token}})
      if (response.data.success) {
        let allOrdersItem = []
        response.data.orders.map((order)=>{
          order.items.map((item)=>{
            item['orderId'] = order._id
            item['status'] = order.status
            item['payment'] = order.payment
            item['paymentMethod'] = order.paymentMethod
            item['date'] = order.date
            allOrdersItem.push(item)
          })
        })
        setOrderData(allOrdersItem.reverse())
      }
      
    } catch (error) {
      
    }
  }

  const cancelOrder = (orderId) => {
    setSelectedOrderId(orderId);
    setShowCancelModal(true);
  }

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
  }

  useEffect(()=>{
    loadOrderData()
  },[token])

  return (
    <div className='border-t pt-16'>

        <div className='text-2xl'>
            <Title text1={'MY'} text2={'ORDERS'} />
        </div>

        <div>
            {orderData.length === 0 
              ? <div className='flex flex-col items-center justify-center my-20'>
                  <p className='text-xl text-gray-500'>You have no orders yet</p>
                  <button onClick={() => navigate('/collection')} className='bg-black text-white text-sm my-8 px-8 py-3 mt-4'>EXPLORE PRODUCTS</button>
                </div>
              : orderData.map((item,index) => (
                <div key={index} className='py-4 border-t border-b text-gray-700 flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
                    <div className='flex items-start gap-6 text-sm'>
                        <img className='w-16 sm:w-20' src={item.image[0]} alt="" />
                        <div>
                            <p className='sm:text-base font-medium'>{item.name}</p>
                            <div className='flex items-center gap-3 mt-1 text-base text-gray-700'>
                                <p>{currency}{item.price}</p>
                                <p>Quantity: {item.quantity}</p>
                                <p>Size: {item.size}</p>
                            </div>
                            <p className='mt-1'>Date: <span className=' text-gray-400'>{new Date(item.date).toDateString()}</span></p>
                            <p className='mt-1'>Payment: <span className=' text-gray-400'>{item.paymentMethod}</span></p>
                            <div className='mt-2 flex items-center gap-2'>
                                <span className='text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded font-mono'>Order ID:</span>
                                <span className='text-xs font-mono font-bold text-gray-700 bg-orange-50 border border-orange-100 px-2 py-0.5 rounded select-all'>{item.orderId}</span>
                            </div>
                        </div>
                    </div>
                    <div className='md:w-1/2 flex justify-between'>
                        <div className='flex items-center gap-2'>
                            <p className='min-w-2 h-2 rounded-full bg-green-500'></p>
                            <p className='text-sm md:text-base'>{item.status}</p>
                        </div>
                        <div className='flex items-center gap-4'>
                            <button onClick={loadOrderData} className='border px-4 py-2 text-sm font-medium rounded-sm'>Track Order</button>
                            { (item.status === 'Order Placed' || item.status === 'Packing') && (
                                <button onClick={() => cancelOrder(item.orderId)} className='border px-4 py-2 text-sm font-medium rounded-sm text-red-500 hover:bg-red-50'>Cancel Order</button>
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
    </div>
  )
}

export default Orders