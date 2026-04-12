import React, { useContext, useEffect } from 'react'
import { ShopContext } from '../context/ShopContext'
import { useSearchParams } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'

const Verify = () => {

    const { navigate, token, setCartItems, backendUrl } = useContext(ShopContext)
    const [searchParams] = useSearchParams()

    const success = searchParams.get('success')
    const orderId = searchParams.get('orderId')

    const verifyPayment = async () => {
        try {
            if (!token) return null

            const response = await axios.post(
                backendUrl + '/api/order/verifyStripe',
                { success, orderId },
                { headers: { token } }
            )

            if (response.data.success) {
                setCartItems({})
                toast.success('Payment successful! Order placed.')
                navigate('/orders')
            } else {
                toast.error('Payment failed or was cancelled.')
                navigate('/cart')
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
            navigate('/cart')
        }
    }

    useEffect(() => {
        verifyPayment()
    }, [token])

    return (
        <div className='min-h-[60vh] flex items-center justify-center'>
            <div className='text-center'>
                <div className='w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4'></div>
                <p className='text-gray-600'>Verifying your payment...</p>
            </div>
        </div>
    )
}

export default Verify
