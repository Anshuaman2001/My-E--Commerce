import React from 'react'
import Title from '../components/Title'
import { assets } from '../assets/assets'
import NewsletterBox from '../components/NewsletterBox'

const PrivacyPolicy = () => {
  return (
    <div className='border-t pt-10'>

      <div className='text-2xl text-center pb-8'>
          <Title text1={'PRIVACY'} text2={'POLICY'} />
      </div>

      <div className='my-10 flex flex-col md:flex-row gap-16'>
          <img className='w-full md:max-w-[450px]' src={assets.privacy_img} alt="Privacy Policy" />
          <div className='flex flex-col justify-center gap-6 md:w-2/4 text-gray-600'>
              <p>At Forever, your privacy is our top priority. We are dedicated to protecting your personal information and being transparent about how we collect, use, and safeguard your data when you interact with our platform.</p>
              <p>This policy outlines the measures we take to ensure your shopping experience is secure and your information is handled with the highest level of confidentiality. We comply with global data protection standards to give you complete control over your personal data.</p>
              <b className='text-gray-800'>Data Collection & Usage</b>
              <p>We collect only the essential information required to process your orders, provide personalized recommendations, and improve our services. This includes your name, contact details, and shipping address. We never sell your data to third parties.</p>
          </div>
      </div>

      <div className='flex flex-col gap-8 text-sm text-gray-600 mb-20'>
          <div>
            <b className='text-gray-800 block mb-2'>1. Information We Collect</b>
            <p>We collect personal information you provide when creating an account, placing an order, or subscribing to our newsletter. This may include your IP address and browsing behavior to enhance site performance.</p>
          </div>
          <div>
            <b className='text-gray-800 block mb-2'>2. How We Use Your Information</b>
            <p>Your information is used to fulfill orders, process payments, and communicate regarding your purchases. With your consent, we may send promotional offers and updates about new collections.</p>
          </div>
          <div>
            <b className='text-gray-800 block mb-2'>3. Data Security</b>
            <p>We implement advanced encryption and security protocols (SSL) to protect your sensitive data. Regular audits are conducted to ensure our systems remain robust against unauthorized access.</p>
          </div>
          <div>
            <b className='text-gray-800 block mb-2'>4. Your Rights</b>
            <p>You have the right to access, correct, or delete your personal data at any time. You can manage your preferences through your account settings or by contacting our support team.</p>
          </div>
      </div>

      <NewsletterBox/>
      
    </div>
  )
}

export default PrivacyPolicy
