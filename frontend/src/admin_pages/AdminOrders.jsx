import React, { useContext, useEffect, useState } from 'react'
import axios from 'axios'
import { ShopContext } from '../context/ShopContext'
import { toast } from 'react-toastify'
import { assets } from '../assets/assets'
import { Package } from 'lucide-react'

const AdminOrders = () => {

  const { backendUrl, token, currency } = useContext(ShopContext);
  const [orders, setOrders] = useState([])

  const fetchAllOrders = async () => {
    if (!token) return;

    try {
      const response = await axios.post(backendUrl + '/api/order/list', {}, { headers: { token } })
      if (response.data.success) {
        setOrders(response.data.orders.reverse())
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  const statusHandler = async (event, orderId) => {
    try {
      const response = await axios.post(backendUrl + '/api/order/status', { orderId, status: event.target.value }, { headers: { token } })
      if (response.data.success) {
        await fetchAllOrders()
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  useEffect(() => {
    fetchAllOrders()
  }, [token])

  return (
    <div>
      <p className='mb-6 font-medium prata-regular text-2xl'>Customer Orders</p>
      <div>
        {
          orders.map((order, index) => (
            <div className='grid grid-cols-1 sm:grid-cols-[0.5fr_2fr_1fr] lg:grid-cols-[0.5fr_2fr_1fr_1fr_1fr] gap-4 items-start border-2 border-gray-100 p-5 md:p-8 my-3 md:my-4 text-xs md:text-sm text-gray-700 bg-white hover:shadow-md transition-shadow' key={index}>
              <div className='flex items-center justify-center bg-gray-50 p-4 rounded'>
                <Package size={40} className='text-gray-400' />
              </div>
              <div>
                <div>
                  {order.items.map((item, index) => {
                    if (index === order.items.length - 1) {
                      return <p className='py-0.5 font-medium' key={index}> {item.name} x {item.quantity} <span> {item.size} </span> </p>
                    } else {
                      return <p className='py-0.5 font-medium' key={index}> {item.name} x {item.quantity} <span> {item.size} </span> , </p>
                    }
                  })}
                </div>
                <p className='mt-3 mb-2 font-bold text-gray-900'>{order.address.firstName + " " + order.address.lastName}</p>
                <div className='text-gray-500'>
                  <p>{order.address.street + ","}</p>
                  <p>{order.address.city + ", " + order.address.state + ", " + order.address.country + ", " + order.address.zipcode}</p>
                </div>
                <p className='mt-2 font-medium'>{order.address.phone}</p>
                {order.cancelReason && (
                    <div className='mt-3 p-2 bg-red-50 text-red-600 rounded text-xs border border-red-100'>
                        <strong>Cancellation Reason:</strong> {order.cancelReason}
                    </div>
                )}
              </div>
              <div>
                <p className='text-sm sm:text-[15px]'>Items: {order.items.length}</p>
                <p className='mt-3'>Method: <span className='font-medium uppercase'>{order.paymentMethod}</span></p>
                <p>Payment: <span className={order.payment ? 'text-green-600 font-medium' : 'text-orange-600 font-medium'}>{order.payment ? 'Done' : 'Pending'}</span></p>
                <p>Date: <span className='text-gray-400'>{new Date(order.date).toLocaleDateString()}</span></p>
                <div className='mt-3 flex flex-col gap-1'>
                  <span className='text-[10px] text-gray-400 font-mono uppercase tracking-wider'>Order ID</span>
                  <span className='text-[10px] font-mono font-bold text-gray-600 bg-orange-50 border border-orange-100 px-2 py-1 rounded select-all break-all'>{order._id}</span>
                </div>
              </div>
              <p className='text-sm sm:text-[15px] font-bold text-gray-900'>{currency}{order.amount}</p>
              <select onChange={(event) => statusHandler(event, order._id)} value={order.status} className='p-2 font-semibold border border-gray-200 outline-none focus:border-black transition-colors rounded'>
                <option value="Order Placed">Order Placed</option>
                <option value="Packing">Packing</option>
                <option value="Shipped">Shipped</option>
                <option value="Out for delivery">Out for delivery</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          ))
        }
      </div>
    </div>
  )
}

export default AdminOrders
