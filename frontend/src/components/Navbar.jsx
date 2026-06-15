import React, { useContext, useState, useEffect } from 'react'
import logo from '../assets/logo.png'
import search_icon from '../assets/search_icon.png'
import profile_icon from '../assets/profile_icon.png'
import cart_icon from '../assets/cart_icon.png'
import menu_icon from '../assets/menu_icon.png'
import dropdown_icon from '../assets/dropdown_icon.png'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext'
import { motion, AnimatePresence } from 'framer-motion'
import { 
    User, 
    Package, 
    Ticket, 
    Coins, 
    Zap, 
    LayoutDashboard,
    CreditCard, 
    MapPin, 
    Heart, 
    Gift, 
    Bell, 
    LogOut,
    Search,
    ShoppingBag,
    Menu,
    X
} from 'lucide-react'

const Navbar = () => {
    const [visible, setVisible] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const location = useLocation();
    const { setShowSearch, getCartCount, navigate, token, setToken, setCartItems, userData, setUserData, getWishlistCount } = useContext(ShopContext);

    // Track scroll for floating effect
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const logout = () => {
        navigate('/login')
        localStorage.removeItem('token')
        setToken('')
        setCartItems({})
        setUserData(null)
        localStorage.removeItem('userData')
    }

    const navLinks = [
        { name: 'HOME', path: '/' },
        { name: 'COLLECTION', path: '/collection' },
        { name: 'ABOUT', path: '/about' },
        { name: 'CONTACT', path: '/contact' }
    ];

    const containerVariants = {
        hidden: { opacity: 0, y: -20 },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: { staggerChildren: 0.1, duration: 0.5 }
        }
    }

    const linkVariants = {
        hidden: { opacity: 0, y: -10 },
        visible: { opacity: 1, y: 0 }
    }

    return (
        <motion.div 
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className={`fixed top-0 left-0 right-0 z-[10000] px-4 sm:px-[5vw] transition-all duration-500 ease-in-out ${
                scrolled 
                ? 'py-3' 
                : 'py-6 bg-transparent'
            }`}
        >
            <div className={`max-w-7xl mx-auto flex items-center justify-between transition-all duration-500 ${
                scrolled 
                ? 'bg-white/80 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.08)] px-4 sm:px-8 py-3 rounded-2xl sm:rounded-full' 
                : ''
            }`}>
                {/* Logo */}
                <motion.div 
                    variants={linkVariants}
                    whileHover={{ scale: 1.05 }}
                    className="flex-shrink-0"
                >
                    <img onClick={() => navigate('/')} src={logo} className="w-28 sm:w-32 cursor-pointer" alt="Logo" />
                </motion.div>

                {/* Nav Links */}
                <ul className='hidden md:flex items-center gap-8'>
                    {navLinks.map((link) => (
                        <motion.li key={link.name} variants={linkVariants} className="relative">
                            <NavLink 
                                to={link.path} 
                                className={({isActive}) => `text-[13px] font-bold tracking-widest transition-colors duration-300 ${isActive ? 'text-[#ff4f00]' : 'text-gray-600 hover:text-black'}`}
                            >
                                {link.name}
                                {location.pathname === link.path && (
                                    <motion.div 
                                        layoutId="navIndicator"
                                        className="absolute -bottom-1 left-0 right-0 h-[2px] bg-[#ff4f00] rounded-full"
                                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                    />
                                )}
                            </NavLink>
                        </motion.li>
                    ))}
                </ul>

                {/* Icons */}
                <div className='flex items-center gap-4 sm:gap-6'>
                    <motion.div variants={linkVariants} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                        <Search onClick={() => setShowSearch(true)} className='w-5 h-5 cursor-pointer text-gray-700 hover:text-[#ff4f00] transition-colors' />
                    </motion.div>

                    <motion.div variants={linkVariants} className='group relative'>
                        <div className='relative'>
                            <img 
                                onClick={() => !token && navigate('/login')} 
                                src={userData && userData.image ? userData.image : profile_icon} 
                                className='w-8 h-8 cursor-pointer rounded-full border border-gray-200 shadow-sm transition-transform hover:scale-110 active:scale-95' 
                                alt="Profile" 
                            />
                            {token && getWishlistCount() > 0 && (
                                <span className='absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full'></span>
                            )}
                        </div>
                        
                        <AnimatePresence>
                            {token && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                                    className='hidden group-hover:block absolute right-0 pt-4 z-50 origin-top-right'
                                >
                                    <div className='flex flex-col min-w-[280px] bg-white border border-gray-100 rounded-3xl shadow-2xl overflow-hidden'>
                                        <div className='px-6 py-4 border-b bg-gray-50/50'>
                                            <p className='text-xs font-bold text-gray-400 uppercase tracking-widest'>Your Account</p>
                                        </div>
                                        <div className='max-h-[70vh] overflow-y-auto px-2 py-2 space-y-1'>
                                            {userData?.role === 'admin' && (
                                                <div onClick={() => navigate('/admin')} className='flex items-center gap-4 px-4 py-3 hover:bg-orange-50 rounded-2xl cursor-pointer transition-all group/item'>
                                                    <div className='p-2 bg-orange-100 text-orange-600 rounded-xl'><LayoutDashboard size={18} /></div>
                                                    <p className='text-sm group-hover/item:translate-x-1 transition-transform font-bold'>Admin Panel</p>
                                                </div>
                                            )}
                                            {[
                                                { label: 'My Profile', icon: <User size={18} />, path: '/profile', color: 'blue' },
                                                { label: 'Orders', icon: <Package size={18} />, path: '/orders', color: 'blue' },
                                                { label: 'Wishlist', icon: <Heart size={18} />, path: '/wishlist', count: getWishlistCount(), color: 'red' },
                                                { label: 'Saved Addresses', icon: <MapPin size={18} />, path: '/manage-addresses', color: 'purple' },
                                                { label: 'Support Tickets', icon: <Ticket size={18} />, path: '/support', color: 'green' }
                                            ].map((item) => (
                                                <div key={item.label} onClick={() => navigate(item.path)} className='flex items-center justify-between px-4 py-3 hover:bg-gray-50 rounded-2xl cursor-pointer transition-all group/item'>
                                                    <div className='flex items-center gap-4'>
                                                        <div className={`p-2 bg-${item.color}-50 text-${item.color}-600 rounded-xl`}>{item.icon}</div>
                                                        <p className='text-sm group-hover/item:translate-x-1 transition-transform'>{item.label}</p>
                                                    </div>
                                                    {item.count > 0 && (
                                                        <span className='bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full'>{item.count}</span>
                                                    )}
                                                </div>
                                            ))}
                                            <div onClick={logout} className='flex items-center gap-4 px-4 py-4 hover:bg-red-50 rounded-2xl cursor-pointer transition-all border-t mt-2'>
                                                <div className='p-2 bg-red-100 text-red-600 rounded-xl'><LogOut size={18} /></div>
                                                <p className='text-sm font-bold text-red-600'>Logout</p>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>

                    <motion.div variants={linkVariants} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className='relative'>
                        <Link to='/cart'>
                            <ShoppingBag className='w-6 h-6 text-gray-700 hover:text-[#ff4f00] transition-colors' />
                            <p className='absolute -top-1 -right-1.5 w-4.5 h-4.5 bg-black text-white flex items-center justify-center rounded-full text-[9px] font-bold border-2 border-white'>
                                {getCartCount()}
                            </p>
                        </Link>
                    </motion.div>

                    <motion.div variants={linkVariants} className="md:hidden">
                        <Menu onClick={() => setVisible(true)} className='w-6 h-6 text-gray-700 cursor-pointer' />
                    </motion.div>
                </div>
            </div>

            {/* Mobile Sidebar */}
            <AnimatePresence>
                {visible && (
                    <motion.div 
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className='fixed top-0 right-0 bottom-0 w-full xs:w-80 bg-white shadow-2xl z-[10001] flex flex-col'
                    >
                        <div className='flex items-center justify-between p-6 border-b'>
                            <p className='font-bold tracking-widest text-[#ff4f00]'>MENU</p>
                            <X onClick={() => setVisible(false)} className='w-6 h-6 text-gray-500 cursor-pointer hover:rotate-90 transition-transform duration-300' />
                        </div>
                        <div className='flex flex-col p-4'>
                            {navLinks.map((link, idx) => (
                                <motion.div 
                                    key={link.name} 
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 + (idx * 0.1) }}
                                >
                                    <NavLink 
                                        onClick={() => setVisible(false)} 
                                        className={({isActive}) => `flex items-center justify-between py-4 px-6 rounded-2xl mb-2 text-sm font-bold tracking-widest ${isActive ? 'bg-orange-50 text-[#ff4f00]' : 'text-gray-600 hover:bg-gray-50'}`} 
                                        to={link.path}
                                    >
                                        {link.name}
                                    </NavLink>
                                </motion.div>
                            ))}
                            {!token ? (
                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                                    <Link onClick={() => setVisible(false)} to='/login' className='mt-8 flex items-center justify-center bg-black text-white py-4 rounded-2xl font-bold tracking-widest text-sm shadow-xl'>
                                        LOGIN
                                    </Link>
                                </motion.div>
                            ) : (
                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                                    <button onClick={() => { logout(); setVisible(false); }} className='mt-8 w-full flex items-center justify-center bg-red-50 text-red-600 py-4 rounded-2xl font-bold tracking-widest text-sm border border-red-100'>
                                        LOGOUT
                                    </button>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}

export default Navbar
