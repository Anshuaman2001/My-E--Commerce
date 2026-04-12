import React, { useState } from 'react';

const CancelModal = ({ orderId, onClose, onConfirm }) => {
    const reasons = [
        "Ordered by mistake",
        "Found better price elsewhere",
        "Shipping takes too long",
        "Changed my mind",
        "Address is incorrect",
        "Other"
    ];

    const [selectedReason, setSelectedReason] = useState("");
    const [customReason, setCustomReason] = useState("");

    const handleConfirm = () => {
        const finalReason = selectedReason === "Other" ? customReason : selectedReason;
        if (!finalReason) {
            alert("Please select a reason for cancellation");
            return;
        }
        onConfirm(orderId, finalReason);
    };

    return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="bg-gray-50 px-6 py-4 border-b flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-gray-800">Cancel Order</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
                </div>

                {/* Body */}
                <div className="p-6">
                    <p className="text-sm text-gray-500 mb-6 italic">We're sorry to see you cancel. Please let us know the reason to help us improve.</p>
                    
                    <div className="flex flex-col gap-3">
                        {reasons.map((reason, index) => (
                            <label key={index} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${selectedReason === reason ? 'border-orange-500 bg-orange-50' : 'border-gray-100 hover:bg-gray-50'}`}>
                                <input 
                                    type="radio" 
                                    name="cancelReason" 
                                    value={reason} 
                                    checked={selectedReason === reason}
                                    onChange={(e) => setSelectedReason(e.target.value)}
                                    className="accent-orange-500 w-4 h-4"
                                />
                                <span className={`text-sm ${selectedReason === reason ? 'text-orange-900 font-medium' : 'text-gray-700'}`}>{reason}</span>
                            </label>
                        ))}
                    </div>

                    {selectedReason === "Other" && (
                        <div className="mt-4 animate-in slide-in-from-top-2 duration-200">
                            <textarea 
                                value={customReason}
                                onChange={(e) => setCustomReason(e.target.value)}
                                className="w-full border border-gray-200 rounded-lg p-3 text-sm outline-none focus:border-orange-500 transition-colors"
                                rows="3"
                                placeholder="Please specify the reason..."
                            ></textarea>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t flex gap-3">
                    <button 
                        onClick={onClose}
                        className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Keep Order
                    </button>
                    <button 
                        onClick={handleConfirm}
                        className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors shadow-md shadow-red-100"
                    >
                        Confirm Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CancelModal;
