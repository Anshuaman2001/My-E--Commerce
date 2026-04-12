import React, { useContext, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import { assets } from '../assets/assets'
import axios from 'axios'
import { toast } from 'react-toastify'

const ReviewSection = ({ productId, reviews, onReviewAdded }) => {

    const { token, backendUrl, userData } = useContext(ShopContext);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        if (!token) {
            toast.error("Please login to leave a review");
            return;
        }

        try {
            setLoading(true);
            const response = await axios.post(backendUrl + '/api/product/add-review', {
                productId,
                rating,
                comment,
                name: userData.name
            }, { headers: { token } });

            if (response.data.success) {
                toast.success(response.data.message);
                setComment('');
                onReviewAdded();
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    }

    const renderStars = (count) => {
        return (
            <div className='flex gap-1'>
                {[1, 2, 3, 4, 5].map((star) => (
                    <img key={star} src={star <= count ? assets.star_icon : assets.star_dull_icon} className='w-3 h-3' alt="" />
                ))}
            </div>
        )
    }

    return (
        <div className='mt-20'>
            <div className='flex items-center gap-4 mb-6'>
                <h2 className='text-2xl font-medium'>Customer Reviews</h2>
                <span className='bg-gray-100 px-3 py-1 text-sm rounded-full'>{reviews.length} Reviews</span>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-12'>
                {/* Review List */}
                <div className='flex flex-col gap-6 max-h-[500px] overflow-y-auto pr-4'>
                    {reviews.length === 0 ? (
                        <p className='text-gray-500 italic'>No reviews yet. Be the first to review!</p>
                    ) : (
                        reviews.map((rev, index) => (
                            <div key={index} className='border-b pb-6'>
                                <div className='flex items-center justify-between mb-2'>
                                    <div className='flex items-center gap-2'>
                                        <p className='font-semibold'>{rev.name}</p>
                                        {rev.verified && <span className='text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full'>Verified Buyer</span>}
                                    </div>
                                    <p className='text-xs text-gray-400'>{new Date(rev.date).toLocaleDateString()}</p>
                                </div>
                                {renderStars(rev.rating)}
                                <p className='mt-3 text-gray-600 text-sm leading-relaxed'>{rev.comment}</p>
                            </div>
                        ))
                    )}
                </div>

                {/* Add Review Form */}
                <div className='bg-gray-50 p-6 rounded-lg h-fit'>
                    <h3 className='text-lg font-medium mb-4'>Write a Review</h3>
                    <form onSubmit={onSubmitHandler} className='flex flex-col gap-4'>
                        <div>
                            <p className='text-sm mb-2'>Rating</p>
                            <div className='flex gap-2 text-2xl cursor-pointer'>
                                {[1, 2, 3, 4, 5].map((num) => (
                                    <span 
                                        key={num} 
                                        onClick={() => setRating(num)}
                                        className={num <= rating ? 'text-orange-500' : 'text-gray-300'}
                                    >
                                        ★
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div>
                            <p className='text-sm mb-2'>Comment</p>
                            <textarea 
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                className='w-full border p-3 rounded text-sm outline-none focus:border-black' 
                                rows="4" 
                                placeholder='Share your thoughts about this product...'
                                required
                            ></textarea>
                        </div>
                        <button 
                            disabled={loading}
                            className='bg-black text-white py-3 text-sm active:bg-gray-700 transition-colors disabled:bg-gray-400'
                        >
                            {loading ? 'SUBMITTING...' : 'SUBMIT REVIEW'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default ReviewSection
