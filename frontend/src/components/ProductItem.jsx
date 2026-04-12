import React, { useContext } from 'react'
import { ShopContext } from '../context/ShopContext'
import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'

const ProductItem = ({ id, image, name, price, discountPrice }) => {

    const { currency, wishlist, toggleWishlist, getProductQuantity } = useContext(ShopContext);
    const isWishlisted = wishlist.includes(id);
    const cartQuantity = getProductQuantity(id);

    return (
        <div className='relative group'>
            <Link className='text-gray-700 cursor-pointer' to={`/product/${id}`}>
                <div className='overflow-hidden relative aspect-square'>
                    <img className='hover:scale-110 transition ease-in-out w-full h-full object-cover' src={image[0]} alt="" />
                    {cartQuantity > 0 && (
                        <div className='absolute bottom-2 left-2 bg-black/70 backdrop-blur-sm text-white text-[10px] px-2 py-1 rounded-sm'>
                            {cartQuantity} in cart
                        </div>
                    )}
                </div>
                <p className='pt-3 pb-1 text-sm'>{name}</p>
                <div className='flex items-center gap-2'>
                    {discountPrice ? (
                        <>
                            <p className='text-sm font-bold text-red-600'>{currency}{discountPrice}</p>
                            <p className='text-xs font-medium text-gray-400 line-through'>{currency}{price}</p>
                        </>
                    ) : (
                        <p className='text-sm font-medium'>{currency}{price}</p>
                    )}
                </div>
            </Link>
            
            <button 
                onClick={(e) => {
                    e.preventDefault();
                    toggleWishlist(id);
                }}
                className='absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-all active:scale-125'
            >
                <Heart 
                    size={20} 
                    fill={isWishlisted ? "#ff4d4d" : "transparent"} 
                    className={`${isWishlisted ? "text-[#ff4d4d]" : "text-gray-400"} transition-colors duration-300`} 
                />
            </button>
        </div>
    )
}

export default ProductItem
