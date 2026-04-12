import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from './Title';
import ProductItem from './ProductItem';

const RelatedProducts = ({category,subCategory}) => {

    const { products } = useContext(ShopContext);
    const [related, setRelated] = useState([]);

    useEffect(()=>{

        if (products.length > 0) {
            
            let productsCopy = products.slice();

            productsCopy = productsCopy.filter((item)=> category === item.category);
            productsCopy = productsCopy.filter((item)=> subCategory === item.subCategory);

            setRelated(productsCopy.slice(0,5));
        }

    },[products, category, subCategory])

  return (
    <div className='my-10'>
      <div className='text-2xl sm:text-3xl py-4'>
        <Title text1={'RELATED'} text2={'PRODUCTS'} />
      </div>

      <div className='flex gap-4 sm:gap-6 overflow-x-auto pb-6 scrollbar-hide snap-x'>
        {related.map((item,index)=>(
            <div key={index} className='w-[45%] sm:w-[30%] md:w-[22%] lg:w-[18%] shrink-0 snap-start'>
                <ProductItem id={item._id} name={item.name} price={item.price} image={item.image} discountPrice={item.discountPrice} />
            </div>
        ))}
      </div>
    </div>
  )
}

export default RelatedProducts
