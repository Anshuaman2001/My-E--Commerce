import React from 'react'
import Title from '../components/Title'
import { assets } from '../assets/assets'
import NewsletterBox from '../components/NewsletterBox'

const Delivery = () => {
  return (
    <div>

      <div className='text-2xl text-center pt-8 border-t'>
          <Title text1={'DELIVERY'} text2={'INFORMATION'} />
      </div>

      <div className='my-10 flex flex-col md:flex-row gap-16'>
          <img className='w-full md:max-w-[450px]' src={assets.delivery_img} alt="Delivery" />
          <div className='flex flex-col justify-center gap-6 md:w-2/4 text-gray-600'>
              <p>At Forever, we are committed to delivering your favorite fashion pieces right to your doorstep with speed and care. Our global logistics network ensures that no matter where you are, you receive your order in pristine condition.</p>
              <p>We partner with the world's leading courier services to provide reliable shipping options. From the moment you place your order to the second it arrives, we track every step of the journey to ensure transparency and peace of mind.</p>
              <b className='text-gray-800'>Shipping Methods</b>
              <p>We offer a range of shipping options tailored to your needs, including Standard Shipping (5-7 business days) and Express Shipping (1-2 business days). Shipping costs are calculated at checkout based on your location and chosen method.</p>
          </div>
      </div>

      <div className=' text-xl py-4'>
          <Title text1={'SHIPPING'} text2={'BENEFITS'} />
      </div>

      <div className='flex flex-col md:flex-row text-sm mb-20'>
          <div className='border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5'>
            <b>Fast Dispatch:</b>
            <p className=' text-gray-600'>Orders are processed and dispatched within 24 hours of confirmation, ensuring minimal wait time.</p>
          </div>
          <div className='border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5'>
            <b>Real-time Tracking:</b>
            <p className=' text-gray-600'>Stay updated with every movement of your package through our integrated real-time tracking system.</p>
          </div>
          <div className='border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5'>
            <b>Secure Packaging:</b>
            <p className=' text-gray-600'>We use premium, eco-friendly packaging materials to protect your items from any damage during transit.</p>
          </div>
      </div>

      <NewsletterBox/>
      
    </div>
  )
}

export default Delivery
