import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from '../components/Title'
import ProductItem from '../components/ProductItem'
import { Heart } from 'lucide-react'

const Wishlist = () => {

  const { products, wishlist, token, navigate } = useContext(ShopContext);
  const [wishlistProducts, setWishlistProducts] = useState([])

  useEffect(() => {
    if (!token) {
      navigate('/login')
    }
  }, [token])

  useEffect(() => {
    if (products.length > 0 && wishlist.length > 0) {
      const filtered = products.filter(item => wishlist.some(id => id === item._id))
      setWishlistProducts(filtered)
    } else {
      setWishlistProducts([])
    }
  }, [wishlist, products])

  return (
    <div className='border-t pt-14'>
      <div className='text-2xl mb-10'>
        <Title text1={'MY'} text2={'WISHLIST'} />
      </div>

      {wishlistProducts.length === 0 ? (
        <div className='flex flex-col items-center justify-center py-20 text-gray-400'>
          <Heart size={64} className='mb-4 opacity-10' />
          <p className='text-lg'>Your wishlist is empty</p>
          <button 
            onClick={() => navigate('/collection')}
            className='mt-6 bg-black text-white px-8 py-3 text-sm rounded-sm active:bg-gray-700 transition-all'
          >
            SHOP NOW
          </button>
        </div>
      ) : (
        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6'>
          {wishlistProducts.map((item, index) => (
            <ProductItem key={index} id={item._id} image={item.image} name={item.name} price={item.price} />
          ))}
        </div>
      )}
    </div>
  )
}

export default Wishlist
