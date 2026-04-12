import React, { useState } from 'react';
import './OrderButton.css';

const OrderButton = ({ onClick, type = 'button', text = 'Place Order' }) => {
    const [isAnimating, setIsAnimating] = useState(false);

    const handleClick = (e) => {
        if (!isAnimating) {
            setIsAnimating(true);
            
            // Call the parent's onClick handler
            if (onClick) {
                onClick(e);
            }

            // Reset animation state after it completes (10s as per user code)
            setTimeout(() => {
                setIsAnimating(false);
            }, 10000);
        }
    };

    return (
        <button 
            type={type}
            className={`order-btn ${isAnimating ? 'animate' : ''}`} 
            onClick={handleClick}
        >
            <span className="default">{text}</span>
            <span className="success">
                Order Placed
                <svg viewBox="0 0 12 10">
                    <polyline points="1.5 6 4.5 9 10.5 1"></polyline>
                </svg>
            </span>
            <div className="box"></div>
            <div className="truck">
                <div className="back"></div>
                <div className="front">
                    <div className="window"></div>
                </div>
                <div className="light top"></div>
                <div className="light bottom"></div>
            </div>
            <div className="lines"></div>
        </button>
    );
};

export default OrderButton;
