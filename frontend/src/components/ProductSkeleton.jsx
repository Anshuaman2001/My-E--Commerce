import React from 'react';
import { motion } from 'framer-motion';

const ProductSkeleton = () => {
    return (
        <div className="flex flex-col gap-2 w-full">
            <div className="aspect-square relative overflow-hidden bg-gray-200 rounded-sm">
                <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent"
                    animate={{
                        x: ['-100%', '100%'],
                    }}
                    transition={{
                        repeat: Infinity,
                        duration: 1.5,
                        ease: 'linear',
                    }}
                />
            </div>
            <div className="h-4 w-3/4 bg-gray-200 rounded-sm overflow-hidden relative">
                <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                />
            </div>
            <div className="h-4 w-1/2 bg-gray-200 rounded-sm overflow-hidden relative">
                <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                />
            </div>
        </div>
    );
};

export default ProductSkeleton;
