import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';

const Login = () => {

  const [currentState, setCurrentState] = useState('Login');
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const { token, setToken, backendUrl, setUserData } = useContext(ShopContext)
  const navigate = useNavigate();

  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')

  useEffect(() => {
    // Debug: Ensure Google Client ID is loaded correctly
    if (!import.meta.env.VITE_GOOGLE_CLIENT_ID) {
      console.warn("VITE_GOOGLE_CLIENT_ID is missing from environment variables.");
    }
  }, []);

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const response = await axios.post(backendUrl + '/api/user/google-login', {
        idToken: credentialResponse.credential
      })
      if (response.data.success) {
        setToken(response.data.token)
        localStorage.setItem('token', response.data.token)
        setUserData(response.data.user)
        localStorage.setItem('userData', JSON.stringify(response.data.user))
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message)
    }
  }

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    try {
      if (currentState === 'Sign Up') {
        const response = await axios.post(backendUrl + '/api/user/register', { name, email, password })
        if (response.data.success) {
          setToken(response.data.token)
          localStorage.setItem('token', response.data.token)
          setUserData(response.data.user)
          localStorage.setItem('userData', JSON.stringify(response.data.user))
        } else {
          toast.error(response.data.message)
        }
      } else {
        const endpoint = isAdminLogin ? '/api/user/admin' : '/api/user/login';
        const response = await axios.post(backendUrl + endpoint, { email, password })
        if (response.data.success) {
          setToken(response.data.token)
          localStorage.setItem('token', response.data.token)
          if (response.data.user) {
            setUserData(response.data.user)
            localStorage.setItem('userData', JSON.stringify(response.data.user))
          } else if (isAdminLogin) {
            // For legacy admin login that doesn't return user object
            const adminUser = { name: 'Admin', email: email, role: 'admin' };
            setUserData(adminUser);
            localStorage.setItem('userData', JSON.stringify(adminUser));
          }
        } else {
          toast.error(response.data.message)
        }
      }

    } catch (error) {
      console.log(error);
      toast.error(error.message)
    }
  }

  useEffect(() => {
    if (token) {
      navigate('/')
    }
  }, [token])

  return (
    <form onSubmit={onSubmitHandler} className='flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800'>
      
      {/* Login Mode Selector (Tabs) */}
      <div className='flex w-full mb-6 border-b'>
          <div 
            onClick={() => { setIsAdminLogin(false); setCurrentState('Login'); }}
            className={`flex-1 text-center py-2 cursor-pointer transition-all duration-300 ${!isAdminLogin ? 'border-b-2 border-black font-bold text-black' : 'text-gray-400 hover:text-gray-600'}`}
          >
              Customer
          </div>
          <div 
            onClick={() => { setIsAdminLogin(true); setCurrentState('Login'); }}
            className={`flex-1 text-center py-2 cursor-pointer transition-all duration-300 ${isAdminLogin ? 'border-b-2 border-black font-bold text-black' : 'text-gray-400 hover:text-gray-600'}`}
          >
              Admin
          </div>
      </div>

      <div className='inline-flex items-center gap-2 mb-2'>
        <p className='prata-regular text-3xl'>{isAdminLogin ? 'Admin Sign In' : currentState}</p>
        <hr className='border-none h-[1.5px] w-8 bg-gray-800' />
      </div>

      {!isAdminLogin && currentState === 'Sign Up' && (
        <input onChange={(e) => setName(e.target.value)} value={name} type="text" className='w-full px-3 py-2 border border-gray-800' placeholder='Name' required />
      )}
      
      <input onChange={(e) => setEmail(e.target.value)} value={email} type="email" className='w-full px-3 py-2 border border-gray-800' placeholder='Email' required />
      <input onChange={(e) => setPassword(e.target.value)} value={password} type="password" className='w-full px-3 py-2 border border-gray-800' placeholder='Password' required />
      
      <div className='w-full flex justify-between text-sm mt-[-8px]'>
        <p className=' cursor-pointer'>Forgot your password?</p>
        {!isAdminLogin && (
            currentState === 'Login'
                ? <p onClick={() => setCurrentState('Sign Up')} className=' cursor-pointer'>Create account</p>
                : <p onClick={() => setCurrentState('Login')} className=' cursor-pointer'>Login Here</p>
        )}
      </div>

      <button className='bg-black text-white font-light px-8 py-2 mt-4'>
          {isAdminLogin ? 'Admin Sign In' : (currentState === 'Login' ? 'Sign In' : 'Sign Up')}
      </button>
      
      {!isAdminLogin && (
          <>
            <div className='flex items-center gap-2 w-full my-2'>
                <hr className='flex-1 border-gray-300' />
                <p className='text-gray-400 text-xs'>OR</p>
                <hr className='flex-1 border-gray-300' />
            </div>

            <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => toast.error("Google Login Failed")}
            />
          </>
      )}
    </form>
  )
}

export default Login