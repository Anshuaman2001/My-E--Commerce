import React from 'react'
import { NavLink } from 'react-router-dom'
import { PlusCircle, List, ShoppingBag, MessageSquare } from 'lucide-react'

const AdminSidebar = () => {
  return (
    <div className='w-[18%] min-h-screen border-r-2'>
        <div className='flex flex-col gap-4 pt-6 pl-[20%] text-[15px]'>
            <NavLink className='flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l' to="/admin/add">
                <PlusCircle size={20} />
                <p className='hidden md:block'>Add Items</p>
            </NavLink>

            <NavLink className='flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l' to="/admin/list">
                <List size={20} />
                <p className='hidden md:block'>List Items</p>
            </NavLink>

            <NavLink className='flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l' to="/admin/orders">
                <ShoppingBag size={20} />
                <p className='hidden md:block'>Orders</p>
            </NavLink>

            <NavLink className='flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l' to="/admin/tickets">
                <MessageSquare size={20} />
                <p className='hidden md:block'>Support Tickets</p>
            </NavLink>
        </div>
    </div>
  )
}

export default AdminSidebar
