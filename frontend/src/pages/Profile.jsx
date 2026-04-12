import React, { useContext, useEffect } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from '../components/Title'
import profile_icon from '../assets/profile_icon.png'

const Profile = () => {

  const { userData, token, navigate } = useContext(ShopContext);

  useEffect(() => {
    if (!token) {
      navigate('/login')
    }
  }, [token])

  return userData ? (
    <div className='border-t pt-10 sm:pt-16'>
      <div className='text-2xl'>
        <Title text1={'MY'} text2={'PROFILE'} />
      </div>

      <div className='mt-10 flex flex-col items-center sm:flex-row sm:items-start gap-10 bg-slate-50 p-8 rounded-lg shadow-sm font-light'>
        {/* Profile Image */}
        <div className='w-40 h-40 flex-shrink-0'>
          <img 
            className='w-full h-full rounded-full object-cover border-4 border-white shadow-md' 
            src={userData.image || profile_icon} 
            alt="Profile" 
          />
        </div>

        {/* User Details */}
        <div className='flex flex-col gap-4 text-gray-700 w-full'>
          <div className='border-b pb-2 flex flex-col gap-1'>
            <p className='text-sm text-gray-500 uppercase tracking-widest'>Full Name</p>
            <p className='text-2xl font-medium text-black'>{userData.name}</p>
          </div>

          <div className='border-b pb-2 flex flex-col gap-1'>
            <p className='text-sm text-gray-500 uppercase tracking-widest'>Email Address</p>
            <p className='text-lg'>{userData.email}</p>
          </div>

          <div className='mt-6 flex flex-wrap gap-4'>
            <button 
              onClick={() => navigate('/orders')} 
              className='bg-black text-white px-8 py-3 text-sm active:bg-gray-700 transition-all rounded-sm'
            >
              MY ORDERS
            </button>
            <button 
              onClick={() => navigate('/collection')} 
              className='border border-black px-8 py-3 text-sm hover:bg-black hover:text-white transition-all rounded-sm'
            >
              CONTINUE SHOPPING
            </button>
          </div>
        </div>
      </div>
    </div>
  ) : null
}

export default Profile
