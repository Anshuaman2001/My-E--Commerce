import React, { useContext, useEffect, useState } from 'react'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Routes, Route, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Orders from './pages/Orders'
import PlaceOrder from './pages/PlaceOrder'
import Product from './pages/Product'
import Collection from './pages/Collection'
import Contact from './pages/Contact'
import About from './pages/About'
import Cart from './pages/Cart'
import Wishlist from './pages/Wishlist'
import Navbar from './components/Navbar'
import SearchBar from './components/SearchBar'
import Footer from './components/Footer'
import ScrollToTop from './components/ScrollToTop'
import Verify from './pages/Verify'
import Delivery from './pages/Delivery'
import PrivacyPolicy from './pages/PrivacyPolicy'
import Profile from './pages/Profile'
import ManageAddresses from './pages/ManageAddresses'
import Support from './pages/Support'
import ChatWidget from './components/ChatWidget'
import AdminLayout from './components/AdminLayout'
import AdminAdd from './admin_pages/AdminAdd'
import AdminList from './admin_pages/AdminList'
import AdminOrders from './admin_pages/AdminOrders'
import AdminTickets from './admin_pages/AdminTickets'
import AdminReviews from './admin_pages/AdminReviews'

import { ShopContext } from './context/ShopContext'
import ActionHub from './components/ActionHub'
import { AnimatePresence, motion } from 'framer-motion'
import CookieConsent from './components/CookieConsent'
import OfflineScreen from './components/OfflineScreen'

const AdminProtectedRoute = ({ children }) => {
    const { userData, token } = useContext(ShopContext)
    if (!token || (userData && userData.role !== 'admin')) {
        return <div className='py-20 text-center'>Access Denied. Admins Only.</div> 
    }
    return children
}

const App = () => {
    const location = useLocation();
    const [isOnline, setIsOnline] = useState(() => navigator.onLine);

    useEffect(() => {
        const markOnline = () => setIsOnline(true);
        const markOffline = () => setIsOnline(false);

        window.addEventListener('online', markOnline);
        window.addEventListener('offline', markOffline);

        return () => {
            window.removeEventListener('online', markOnline);
            window.removeEventListener('offline', markOffline);
        };
    }, []);

    if (!isOnline) return <OfflineScreen />;

    return (
        <div className='px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw] pt-16 sm:pt-20 relative overflow-x-hidden min-h-screen'>
            <ToastContainer />
            <ScrollToTop />
            <Navbar />
            <SearchBar />
            
            <AnimatePresence mode='wait'>
                <motion.div
                    key={location.pathname}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                >
                    <Routes location={location} key={location.pathname}>
                        <Route path='/' element={<Home />} />
                        <Route path='/cart' element={<Cart />} />
                        <Route path='/login' element={<Login />} />
                        <Route path='/orders' element={<Orders />} />
                        <Route path='/place-order' element={<PlaceOrder />} />
                        <Route path='/product/:productId' element={<Product />} />
                        <Route path='/collection' element={<Collection />} />
                        <Route path='/contact' element={<Contact />} />
                        <Route path='/about' element={<About />} />
                        <Route path='/verify' element={<Verify />} />
                        <Route path='/delivery' element={<Delivery />} />
                        <Route path='/privacy-policy' element={<PrivacyPolicy />} />
                        <Route path='/profile' element={<Profile />} />
                        <Route path='/manage-addresses' element={<ManageAddresses />} />
                        <Route path='/wishlist' element={<Wishlist />} />
                        <Route path='/support' element={<Support />} />

                        {/* Admin Routes */}
                        <Route path='/admin' element={<AdminProtectedRoute><AdminLayout /></AdminProtectedRoute>}>
                            <Route index element={<AdminList />} />
                            <Route path='add' element={<AdminAdd />} />
                            <Route path='edit/:productId' element={<AdminAdd />} />
                            <Route path='list' element={<AdminList />} />
                            <Route path='orders' element={<AdminOrders />} />
                            <Route path='tickets' element={<AdminTickets />} />
                            <Route path='reviews' element={<AdminReviews />} />

                        </Route>
                    </Routes>
                </motion.div>
            </AnimatePresence>

            <Footer />
            <ChatWidget />
            <ActionHub />
            <CookieConsent />
        </div>
    )
}

export default App

