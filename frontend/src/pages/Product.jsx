import React, { useContext, useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext';
import { assets } from '../assets/assets';
import RelatedProducts from '../components/RelatedProducts';
import { Heart, Activity, ShoppingBag, Zap } from 'lucide-react';
import ReviewSection from '../components/ReviewSection';
import RecentlyViewed from '../components/RecentlyViewed';
import { motion } from 'framer-motion';
import Magnet from '../components/Magnet';
import { toast } from 'react-toastify';

const Product = () => {

  const { productId } = useParams();
  const { products, currency, addToCart, wishlist, toggleWishlist, token } = useContext(ShopContext);
  const navigate = useNavigate();
  const [productData, setProductData] = useState(false);
  const [image, setImage] = useState('')
  const [size, setSize] = useState('')

  const isWishlisted = wishlist.includes(productId);

  const handleBuyNow = () => {
    if (!size) {
      toast.error('Please select a size');
      return;
    }
    if (!token) {
      toast.info('Please login to continue');
      navigate('/login');
      return;
    }
    // Store buy-now item in sessionStorage and go straight to checkout
    const buyNowItem = {
      ...productData,
      size,
      quantity: 1,
    };
    sessionStorage.setItem('buyNowItem', JSON.stringify(buyNowItem));
    navigate('/place-order?buynow=1');
  };
  const fetchProductData = async () => {

    products.map((item) => {
      if (item._id === productId) {
        setProductData(item)
        setImage(item.image[0])
        return null;
      }
    })

  }

  useEffect(() => {
    fetchProductData();
  }, [productId, products])

  useEffect(() => {
    if (productId) {
      let viewedIds = JSON.parse(localStorage.getItem('recentlyViewed')) || [];
      if (!viewedIds.includes(productId)) {
        viewedIds.push(productId);
        // Keep only last 10 viewed items
        if (viewedIds.length > 10) viewedIds.shift();
        localStorage.setItem('recentlyViewed', JSON.stringify(viewedIds));
      }
    }
  }, [productId])

  const calculateAverageRating = () => {
    if (!productData.reviews || productData.reviews.length === 0) return 0;
    const sum = productData.reviews.reduce((acc, rev) => acc + rev.rating, 0);
    return (sum / productData.reviews.length).toFixed(1);
  }

  return productData ? (
    <div className='border-t-2 pt-10 transition-opacity ease-in duration-500 opacity-100'>
      {/*----------- Product Data ----------- */}
      <div className='flex gap-12 sm:gap-12 flex-col sm:flex-row'>

        {/*---------- Product Images ---------- */}
        <div className='flex-1 flex flex-col-reverse gap-3 sm:flex-row'>
          <div className='flex sm:flex-col overflow-x-auto sm:overflow-y-scroll justify-between sm:justify-normal sm:w-[18.7%] w-full'>
              {
                productData.image.map((item, index) => (
                  <img onClick={() => setImage(item)} src={item} key={index} className='w-[24%] sm:w-full sm:mb-3 flex-shrink-0 cursor-pointer' alt="" />
                ))
              }
          </div>
          <div className='w-full sm:w-[80%]'>
              <img className='w-full h-auto' src={image} alt="" />
          </div>
        </div>

        {/* -------- Product Info ---------- */}
        <div className='flex-1'>
          <h1 className='font-medium text-2xl mt-2'>{productData.name}</h1>
          <div className='flex items-center gap-2 mt-1'>
            <span className='text-[10px] text-gray-400 font-mono uppercase tracking-wider'>Product ID:</span>
            <span className='text-[10px] font-mono text-gray-500 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded select-all'>{productId}</span>
          </div>
          <div className=' flex items-center gap-1 mt-2'>
              {[1, 2, 3, 4, 5].map((star) => (
                <img key={star} src={star <= calculateAverageRating() ? assets.star_icon : assets.star_dull_icon} alt="" className="w-3.5" />
              ))}
              <p className='pl-2 text-sm text-gray-400'>({productData.reviews?.length || 0} reviews)</p>
          </div>
          
          {/* Inventory Urgency */}
          <div className='mt-4'>
            {productData.stock <= 0 ? (
              <p className='text-red-500 font-medium flex items-center gap-2'>
                <ShoppingBag size={18} /> Currently Out of Stock
              </p>
            ) : productData.stock < 5 ? (
              <p className='text-orange-600 font-bold flex items-center gap-2 animate-bounce mt-2'>
                <Activity size={18} /> HURRY! Only {productData.stock} left in stock!
              </p>
            ) : (
              <p className='text-green-600 text-sm font-medium'>Available in stock</p>
            )}
          </div>
          <div className='flex items-center gap-3 mt-5'>
            {productData.discountPrice ? (
              <>
                <p className='text-3xl font-medium text-red-600'>{currency}{productData.discountPrice}</p>
                <p className='text-xl text-gray-400 line-through'>{currency}{productData.price}</p>
                <span className='bg-red-100 text-red-600 px-2 py-0.5 rounded text-xs font-bold'>
                  {Math.round(((productData.price - productData.discountPrice) / productData.price) * 100)}% OFF
                </span>
              </>
            ) : (
              <p className='text-3xl font-medium'>{currency}{productData.price}</p>
            )}
          </div>

          {productData.bankOffers && productData.bankOffers.length > 0 && (
            <div className='mt-6 p-4 bg-blue-50/50 border border-blue-100 rounded-xl md:w-4/5'>
              <p className='text-xs font-bold text-blue-800 uppercase tracking-widest mb-3 flex items-center gap-2'>
                <ShoppingBag size={14} className='text-blue-600' /> Available Offers
              </p>
              <div className='flex flex-col gap-2'>
                {productData.bankOffers.map((offer, idx) => (
                  <div key={idx} className='flex items-start gap-2 text-sm text-gray-700'>
                    <div className='w-1.5 h-1.5 bg-blue-400 rounded-full mt-1.5 shrink-0'></div>
                    <p>{offer}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          <p className='mt-5 text-gray-500 md:w-4/5'>{productData.description}</p>
          <div className='flex flex-col gap-4 my-8'>
              <p>Select Size</p>
              <div className='flex gap-2'>
                {productData.sizes.map((item, index) => (
                  <button onClick={() => setSize(item)} className={`border py-2 px-4 bg-gray-100 ${item === size ? 'border-orange-500' : ''}`} key={index}>{item}</button>
                ))}
              </div>
          </div>
          <div className='flex flex-col gap-3 sm:flex-row sm:items-center'>
            <div className='flex items-center gap-3'>
              <Magnet strength={0.1}>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => addToCart(productData._id, size)} 
                  className='bg-black text-white px-8 py-3 text-sm active:bg-gray-700 hover:shadow-xl transition-shadow'
                >
                  ADD TO CART
                </motion.button>
              </Magnet>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleBuyNow}
                className='flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 text-sm font-semibold transition-all shadow-lg shadow-orange-200 hover:shadow-orange-300'
              >
                <Zap size={16} className='fill-white' />
                BUY NOW
              </motion.button>
            </div>
            <button 
              onClick={() => toggleWishlist(productData._id)}
              className='p-3 border rounded-full hover:bg-gray-50 transition-all active:scale-125 group self-start sm:self-auto'
              title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
            >
              <motion.div
                  whileTap={{ scale: 1.5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Heart 
                  size={20} 
                  fill={isWishlisted ? "#ff4d4d" : "transparent"} 
                  className={`${isWishlisted ? "text-[#ff4d4d]" : "text-gray-400 group-hover:text-gray-600"} transition-colors duration-300`} 
                />
              </motion.div>
            </button>
          </div>
          <hr className='mt-8 sm:w-4/5' />
          <div className='text-sm text-gray-500 mt-5 flex flex-col gap-1'>
              <p>100% Original product.</p>
              <p>Cash on delivery is available on this product.</p>
              <p>Easy return and exchange policy within 7 days.</p>
          </div>
        </div>
      </div>

      <ReviewSection 
        productId={productId} 
        reviews={productData.reviews || []} 
        questions={productData.questions || []}
        onReviewAdded={fetchProductData} 
      />

      {/* Recently Viewed */}
      <RecentlyViewed />

      {/* --------- display related products ---------- */}

      <RelatedProducts category={productData.category} subCategory={productData.subCategory} />

    </div>
  ) : <div className=' opacity-0'></div>
}

export default Product