import React, { useState, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShoppingCart, MessageSquare, Plus, X, List } from 'lucide-react';
import { ShopContext } from '../context/ShopContext';
import { Link } from 'react-router-dom';

const ActionHub = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { getCartCount, getWishlistCount, userTickets, navigate } = useContext(ShopContext);

    const cartCount = getCartCount();
    const wishlistCount = getWishlistCount();
    const ticketCount = userTickets.length;

    const hubItems = [
        { 
            icon: <Heart size={20} />, 
            label: 'Wishlist', 
            count: wishlistCount, 
            path: '/wishlist', 
            color: 'bg-red-500' 
        },
        { 
            icon: <ShoppingCart size={20} />, 
            label: 'Cart', 
            count: cartCount, 
            path: '/cart', 
            color: 'bg-blue-600' 
        },
        { 
            icon: <List size={20} />, 
            label: 'Tickets', 
            count: ticketCount, 
            path: '/support', 
            color: 'bg-green-600' 
        },
        { 
            icon: <MessageSquare size={20} />, 
            label: 'Support Chat', 
            action: () => {
                const chatBtn = document.querySelector('#chat-widget-trigger');
                if (chatBtn) chatBtn.click();
                setIsOpen(false);
            },
            color: 'bg-orange-500' 
        }
    ];

    return (
        <div className="fixed bottom-8 right-8 z-[9999]">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.5, y: 20 }}
                        className="absolute bottom-20 right-0 flex flex-col gap-4 items-end"
                    >
                        {hubItems.map((item, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="flex items-center gap-3 group"
                            >
                                <span className="bg-black/80 backdrop-blur-md text-white text-[10px] uppercase font-bold px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-white/10 shadow-xl tracking-wider">
                                    {item.label} {item.count > 0 ? `(${item.count})` : ''}
                                </span>
                                {item.path ? (
                                    <Link 
                                        to={item.path}
                                        onClick={() => setIsOpen(false)}
                                        className={`${item.color} p-4 rounded-full text-white shadow-2xl hover:scale-110 active:scale-95 transition-all relative border border-white/20`}
                                    >
                                        {item.icon}
                                        {item.count > 0 && (
                                            <span className="absolute -top-1 -right-1 bg-white text-black text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-lg border border-gray-100">
                                                {item.count}
                                            </span>
                                        )}
                                    </Link>
                                ) : (
                                    <button
                                        onClick={item.action}
                                        className={`${item.color} p-4 rounded-full text-white shadow-2xl hover:scale-110 active:scale-95 transition-all relative border border-white/20`}
                                    >
                                        {item.icon}
                                    </button>
                                )}
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className={`${isOpen ? 'bg-black' : 'bg-[#ff4f00]'} p-5 rounded-full text-white shadow-[0_10px_40px_rgba(255,79,0,0.4)] hover:shadow-[0_15px_50px_rgba(255,79,0,0.6)] transition-all z-10 border border-white/20 relative`}
            >
                {isOpen ? <X size={28} /> : <Plus size={28} className="animate-pulse" />}
                {!isOpen && (cartCount + wishlistCount > 0) && (
                    <span className="absolute -top-1 -right-1 bg-black text-white text-[11px] font-bold w-6 h-6 flex items-center justify-center rounded-full border-2 border-white shadow-lg">
                        {cartCount + wishlistCount}
                    </span>
                )}
            </motion.button>
        </div>
    );
};

export default ActionHub;
