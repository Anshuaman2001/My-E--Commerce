import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Settings, X, ChevronRight, Check } from 'lucide-react';

const CookieConsent = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [preferences, setPreferences] = useState({
        necessary: true,
        functional: true,
        analytics: true,
        marketing: false,
    });

    const categories = [
        { id: 'necessary', title: 'Necessary Cookies', desc: 'Essential for the site to function properly. Cannot be disabled.', required: true },
        { id: 'functional', title: 'Functional Cookies', desc: 'Remember your preferences like language and theme.', required: false },
        { id: 'analytics', title: 'Analytics Cookies', desc: 'Help us understand how visitors interact with the website.', required: false },
        { id: 'marketing', title: 'Marketing Cookies', desc: 'Used to deliver personalized offers and advertisements.', required: false },
    ];

    useEffect(() => {
        const savedPrefs = localStorage.getItem('cookie_preferences');
        if (!savedPrefs) {
            // Delay banner appearance for a smoother feel
            const timer = setTimeout(() => setIsVisible(true), 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    // Listen for footer clicks
    useEffect(() => {
        const openSettings = () => {
            setIsModalOpen(true);
            setIsVisible(false); // Hide banner if it was open
        };
        window.addEventListener('openCookieSettings', openSettings);
        return () => window.removeEventListener('openCookieSettings', openSettings);
    }, []);

    const saveChoice = (prefs) => {
        localStorage.setItem('cookie_preferences', JSON.stringify(prefs));
        setIsVisible(false);
        setIsModalOpen(false);
    };

    const handleAcceptAll = () => {
        const allOn = { necessary: true, functional: true, analytics: true, marketing: true };
        setPreferences(allOn);
        saveChoice(allOn);
    };

    return (
        <>
            {/* Banner */}
            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        className="fixed bottom-6 left-6 right-6 md:left-auto md:w-[450px] z-[10002]"
                    >
                        <div className="bg-white/80 backdrop-blur-xl border border-white/20 p-6 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)]">
                            <div className="flex items-start gap-4 mb-5">
                                <div className="bg-[#ff4f00] p-3 rounded-2xl shadow-lg shadow-[#ff4f00]/20">
                                    <ShieldCheck className="text-white" size={24} />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-gray-900 mb-1">We respect your privacy</h4>
                                    <p className="text-gray-500 text-xs leading-relaxed">
                                        We use cookies to improve your browsing experience and analyze our traffic. By clicking "Accept All", you consent to our use of cookies.
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={handleAcceptAll}
                                    className="flex-1 bg-black text-white px-5 py-3 rounded-2xl text-[13px] font-bold hover:bg-gray-800 transition-all active:scale-95 shadow-lg shadow-black/10"
                                >
                                    Accept All
                                </button>
                                <button
                                    onClick={() => { setIsModalOpen(true); setIsVisible(false); }}
                                    className="px-5 py-3 rounded-2xl text-[13px] font-bold text-gray-600 border border-gray-100 bg-gray-50/50 hover:bg-white transition-all active:scale-95"
                                >
                                    Customize
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[10003] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
                        onClick={() => setIsModalOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-white/95 backdrop-blur-2xl w-full max-w-lg rounded-[2.5rem] shadow-2xl p-8 overflow-hidden relative"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="bg-orange-50 text-[#ff4f00] p-2 rounded-xl">
                                        <Settings size={20} />
                                    </div>
                                    <h3 className="text-xl font-bold tracking-tight">Cookie Preferences</h3>
                                </div>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <X size={20} className="text-gray-400" />
                                </button>
                            </div>

                            <div className="space-y-4 mb-8">
                                {categories.map((cat) => (
                                    <div 
                                        key={cat.id} 
                                        className="p-5 border border-gray-100 rounded-3xl bg-gray-50/30 hover:bg-white hover:border-orange-100 transition-all group"
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <h5 className="font-bold text-gray-900 text-sm">{cat.title}</h5>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    checked={preferences[cat.id]}
                                                    disabled={cat.required}
                                                    onChange={(e) => setPreferences({ ...preferences, [cat.id]: e.target.checked })}
                                                />
                                                <div className="w-10 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#ff4f00]"></div>
                                            </label>
                                        </div>
                                        <p className="text-[11px] text-gray-500 leading-normal">{cat.desc}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => saveChoice(preferences)}
                                    className="flex-1 bg-black text-white py-4 rounded-2xl font-bold text-sm hover:bg-gray-800 transition-all active:scale-95 shadow-xl shadow-black/5"
                                >
                                    Save Preferences
                                </button>
                                <button
                                    onClick={handleAcceptAll}
                                    className="bg-orange-50 text-[#ff4f00] px-8 py-4 rounded-2xl font-bold text-sm hover:bg-orange-100 transition-all active:scale-95"
                                >
                                    Accept All
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default CookieConsent;
