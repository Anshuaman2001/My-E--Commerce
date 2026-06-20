import React, { useState, useRef, useContext } from 'react';
import { Camera, X, Image as ImageIcon, Loader2, Send, AlertTriangle } from 'lucide-react';
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

const ComplaintModal = ({ item, onClose, onSubmitSuccess }) => {
    const { backendUrl, token, currency } = useContext(ShopContext);
    const [message, setMessage] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 10 * 1024 * 1024) {
            toast.error("File size must be less than 10MB");
            return;
        }
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
        // Show the required success popup/toast for photo upload
        toast.success("Photo uploaded successfully!");
    };

    const handleRemoveImage = () => {
        setImageFile(null);
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!message.trim()) {
            toast.error("Please describe your complaint");
            return;
        }

        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('subject', `Product Complaint: ${item.name} (${item.size})`);
            formData.append('message', message.trim());
            formData.append('orderId', item.orderId);
            if (imageFile) {
                formData.append('image', imageFile);
            }

            const response = await axios.post(backendUrl + '/api/chat/ticket', formData, {
                headers: {
                    token,
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data.success) {
                toast.success(response.data.message || "Complaint raised successfully!");
                onSubmitSuccess?.();
                onClose();
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error(error.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-gray-900 text-white px-6 py-4 flex items-center justify-between shadow-md">
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="text-orange-400 w-5 h-5" />
                        <h3 className="text-lg font-semibold prata-regular">File Product Complaint</h3>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors text-2xl">&times;</button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-6 custom-scroll">
                    
                    {/* Product Summary */}
                    <div className="flex items-center gap-4 bg-gray-50 border border-gray-100 rounded-xl p-4">
                        <img 
                            src={item.image?.[0]} 
                            alt={item.name} 
                            className="w-16 h-16 object-cover rounded-lg border"
                        />
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 text-sm truncate">{item.name}</p>
                            <div className="flex gap-3 text-xs text-gray-500 mt-1">
                                <p>Size: <strong>{item.size}</strong></p>
                                <p>Qty: <strong>{item.quantity}</strong></p>
                                <p>Price: <strong>{currency}{item.price}</strong></p>
                            </div>
                            <p className="text-[10px] text-gray-400 font-mono mt-1">Order ID: #{item.orderId}</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                        
                        {/* Description */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Complaint Description</label>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                rows={4}
                                required
                                placeholder="Describe the issue you're facing with this item (e.g. size mismatch, damage, color fade, incorrect item received)..."
                                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-500 resize-none transition-colors"
                            />
                        </div>

                        {/* Image attachment */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Attach Photo Evidence</label>
                            
                            <input 
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleFileChange}
                            />

                            {imagePreview ? (
                                <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-100 border border-gray-200 max-h-48 flex items-center justify-center">
                                    <img src={imagePreview} alt="Evidence preview" className="max-w-full max-h-full object-contain" />
                                    <button
                                        type="button"
                                        onClick={handleRemoveImage}
                                        className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full border-2 border-dashed border-gray-200 hover:border-orange-300 rounded-xl py-6 flex flex-col items-center justify-center gap-2 transition-colors group"
                                >
                                    <Camera className="w-8 h-8 text-gray-300 group-hover:text-orange-500 transition-colors" />
                                    <span className="text-sm text-gray-400 group-hover:text-gray-700">Click to upload or take a photo</span>
                                </button>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 mt-2 border-t pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-3 border border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition-colors text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="flex-1 bg-black hover:bg-gray-800 text-white font-semibold py-3 rounded-xl transition-all shadow-lg disabled:opacity-60 flex items-center justify-center gap-2 text-sm cursor-pointer"
                            >
                                {submitting ? (
                                    <><Loader2 className="w-4 h-4 animate-spin" /> Raising Ticket...</>
                                ) : (
                                    <><Send className="w-4 h-4" /> Submit Complaint</>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};

export default ComplaintModal;
