import React, { useContext, useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import AdminSidebar from './AdminSidebar'
import { ShopContext } from '../context/ShopContext'

const AdminLayout = () => {
    const { userData, token, navigate } = useContext(ShopContext)

    useEffect(() => {
        if (!token || (userData && userData.role !== 'admin')) {
            // navigate('/')
        }
    }, [userData, token])

    return (
        <div className='flex w-full bg-gray-50/30'>
            <AdminSidebar />
            <div className='flex-1 p-8 sm:p-12'>
                <div className='max-w-6xl mx-auto'>
                    <Outlet />
                </div>
            </div>
        </div>
    )
}

export default AdminLayout
