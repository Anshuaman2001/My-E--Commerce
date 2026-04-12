import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from './Title';
import ProductItem from './ProductItem';

const RecentlyViewed = () => {

    const { products } = useContext(ShopContext);
    const [recentlyViewed, setRecentlyViewed] = useState([]);

    useEffect(() => {
        const viewedIds = JSON.parse(localStorage.getItem('recentlyViewed')) || [];
        if (viewedIds.length > 0 && products.length > 0) {
            const filtered = viewedIds
                .map(id => products.find(p => p._id === id))
                .filter(p => p !== undefined);
            setRecentlyViewed(filtered.reverse());
        }
    }, [products])

    if (recentlyViewed.length === 0) return null;

    return (
        <div className='my-10'>
            <div className='text-2xl sm:text-3xl py-4'>
                <Title text1={'RECENTLY'} text2={'VIEWED'} />
            </div>

            <div className='flex gap-4 sm:gap-6 overflow-x-auto pb-6 scrollbar-hide snap-x'>
                {recentlyViewed.map((item, index) => (
                    <div key={index} className='w-[45%] sm:w-[30%] md:w-[22%] lg:w-[18%] shrink-0 snap-start'>
                        <ProductItem id={item._id} image={item.image} name={item.name} price={item.price} discountPrice={item.discountPrice} />
                    </div>
                ))}
            </div>
        </div>
    )
}

export default RecentlyViewed
