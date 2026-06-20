import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { ShopContext } from '../context/ShopContext'
import { toast } from 'react-toastify'
import { Trash2, Edit } from 'lucide-react'

const AdminList = () => {
  const navigate = useNavigate();
  const { backendUrl, token, currency, getProductsData } = useContext(ShopContext);
  const [list, setList] = useState([])

  const fetchList = async () => {
    try {
      const response = await axios.get(backendUrl + '/api/product/list')
      if (response.data.success) {
        setList(response.data.products.reverse());
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  const removeProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    
    try {
      const response = await axios.post(backendUrl + '/api/product/remove', { id }, { headers: { token } })
      if (response.data.success) {
        toast.success(response.data.message)
        await fetchList();
        if (getProductsData) await getProductsData();
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  useEffect(() => {
    fetchList()
  }, [])

  return (
    <>
      <p className='mb-6 font-medium prata-regular text-2xl'>All Products List</p>
      <div className='flex flex-col gap-2'>

        {/* ------- List Table Title ---------- */}
        <div className='hidden md:grid grid-cols-[1fr_3fr_1fr_1fr_1.5fr_0.5fr] items-center py-2 px-4 border bg-gray-100 text-sm font-bold uppercase'>
          <b>Image</b>
          <b>Name</b>
          <b>Category</b>
          <b>Price</b>
          <b>Stock</b>
          <b className='text-center'>Action</b>
        </div>

        {/* ------ Product List ------ */}
        {
          list.map((item, index) => (
            <div className='grid grid-cols-[1fr_3fr_1fr] md:grid-cols-[1fr_3fr_1fr_1fr_1.5fr_0.5fr] items-center gap-2 py-2 px-4 border text-sm hover:bg-gray-50 transition-colors' key={index}>
              <img className='w-12' src={item.image[0]} alt="" />
              <p className='font-medium'>{item.name}</p>
              <p>{item.category}</p>
              <p>{currency}{item.price}</p>
              <div className='flex items-center gap-2'>
                  <span className={`w-2 h-2 rounded-full ${item.stock > 5 ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  <p>{item.stock} in stock</p>
              </div>
              <div className='flex items-center justify-end md:justify-center gap-3'>
                <p onClick={() => navigate(`/admin/edit/${item._id}`)} className='cursor-pointer text-blue-500 hover:text-blue-700 transition-colors'>
                    <Edit size={18} />
                </p>
                <p onClick={() => removeProduct(item._id)} className='cursor-pointer text-red-500 hover:text-red-700 transition-colors'>
                    <Trash2 size={18} />
                </p>
              </div>
            </div>
          ))
        }

      </div>
    </>
  )
}

export default AdminList
