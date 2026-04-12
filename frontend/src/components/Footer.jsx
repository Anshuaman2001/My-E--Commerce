import React from 'react'
import { assets } from '../assets/assets'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Globe, Share2, MessageCircle, Send, Mail, Phone, MapPin } from 'lucide-react'
import Magnet from './Magnet'

const Footer = () => {
    const containerVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.8,
                staggerChildren: 0.2
            }
        }
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    }

    const socialIcons = [
        { icon: <MessageCircle size={20} />, link: "#" },
        { icon: <Share2 size={20} />, link: "#" },
        { icon: <Globe size={20} />, link: "#" },
        { icon: <Send size={20} />, link: "#" }
    ]

    return (
        <footer className='mt-40 border-t border-gray-100 bg-white/50 backdrop-blur-sm'>
            <motion.div 
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.1 }}
                variants={containerVariants}
                className='flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 py-20 px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw] text-sm'
            >
                <motion.div variants={itemVariants}>
                    <Link to='/'>
                        <motion.img 
                            whileHover={{ scale: 1.05 }}
                            src={assets.logo} 
                            className='mb-6 w-36 cursor-pointer drop-shadow-sm' 
                            alt="Forever Logo" 
                        />
                    </Link>
                    <p className='w-full md:w-4/5 text-gray-500 leading-relaxed mb-8'>
                        Experience the peak of fashion with Forever. We curate the latest trends from luxury brands globally, delivering style and confidence right to your doorstep.
                    </p>
                    <div className='flex gap-4'>
                        {socialIcons.map((social, index) => (
                            <Magnet key={index} strength={0.2}>
                                <a 
                                    href={social.link} 
                                    className='w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 text-gray-600 hover:bg-black hover:text-white transition-all duration-300 shadow-sm border border-gray-100'
                                >
                                    {social.icon}
                                </a>
                            </Magnet>
                        ))}
                    </div>
                </motion.div>

                <motion.div variants={itemVariants}>
                    <p className='text-lg font-bold mb-6 text-gray-900 tracking-tight'>COMPANY</p>
                    <ul className='flex flex-col gap-3 text-gray-500'>
                        {['Home', 'About us', 'Delivery', 'Privacy policy'].map((item) => (
                            <li key={item}>
                                <Link 
                                    to={item === 'Home' ? '/' : `/${item.toLowerCase().replace(' ', '-')}`}
                                    className='hover:text-[#ff4f00] hover:translate-x-1 transition-all duration-300 inline-block'
                                >
                                    {item}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </motion.div>

                <motion.div variants={itemVariants}>
                    <p className='text-lg font-bold mb-6 text-gray-900 tracking-tight'>GET IN TOUCH</p>
                    <ul className='flex flex-col gap-4 text-gray-500'>
                        <li className='flex items-center gap-3 group cursor-pointer'>
                            <div className='p-2 rounded-lg bg-orange-50 text-[#ff4f00] group-hover:bg-[#ff4f00] group-hover:text-white transition-colors duration-300'>
                                <Phone size={16} />
                            </div>
                            <span className='group-hover:text-gray-900 transition-colors'>+1-212-456-7890</span>
                        </li>
                        <li className='flex items-center gap-3 group cursor-pointer'>
                            <div className='p-2 rounded-lg bg-blue-50 text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors duration-300'>
                                <Mail size={16} />
                            </div>
                            <span className='group-hover:text-gray-900 transition-colors'>contact@forever.com</span>
                        </li>
                        <li className='flex items-center gap-3 group'>
                            <div className='p-2 rounded-lg bg-green-50 text-green-500'>
                                <MapPin size={16} />
                            </div>
                            <span>New York, NY, United States</span>
                        </li>
                    </ul>
                </motion.div>
            </motion.div>

            <div className='border-t border-gray-100'>
                <div className='max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-400 font-medium tracking-wide'>
                    <p>© 2024 Forever.com. All Rights Reserved.</p>
                    <div className='flex gap-6 uppercase'>
                        <span className='hover:text-gray-900 cursor-pointer transition-colors'>Terms of Service</span>
                        <span 
                            onClick={() => window.dispatchEvent(new Event('openCookieSettings'))}
                            className='hover:text-gray-900 cursor-pointer transition-colors'
                        >
                            Cookies Settings
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer
