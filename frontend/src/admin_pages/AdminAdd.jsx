import React, { useContext, useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { assets } from '../assets/assets'
import axios from 'axios'
import { ShopContext } from '../context/ShopContext'
import { toast } from 'react-toastify'

const AdminAdd = () => {
    const { productId } = useParams();
    const isEdit = !!productId;
    const navigate = useNavigate();

    const { backendUrl, token } = useContext(ShopContext);

  const [image1, setImage1] = useState(false)
  const [image2, setImage2] = useState(false)
  const [image3, setImage3] = useState(false)
  const [image4, setImage4] = useState(false)

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("Men");
  const [subCategory, setSubCategory] = useState("Topwear");
  const [bestseller, setBestseller] = useState(false);
  const [sizes, setSizes] = useState([]);
  const [stock, setStock] = useState(10);
  const [discountPrice, setDiscountPrice] = useState("");
  const [bankOffers, setBankOffers] = useState("");
  const [existingImages, setExistingImages] = useState([]);

  useEffect(() => {
    if (isEdit && token) {
        const fetchProductData = async () => {
            try {
                const response = await axios.post(backendUrl + '/api/product/single', { productId }, { headers: { token } });
                if (response.data.success) {
                    const p = response.data.product;
                    setName(p.name);
                    setDescription(p.description);
                    setPrice(p.price);
                    setCategory(p.category);
                    setSubCategory(p.subCategory);
                    setBestseller(p.bestseller);
                    setSizes(p.sizes);
                    setStock(p.stock);
                    setDiscountPrice(p.discountPrice || "");
                    setBankOffers(p.bankOffers ? p.bankOffers.join(', ') : "");
                    setExistingImages(p.image || []);
                }
            } catch (error) {
                console.error(error);
                toast.error("Failed to load product for editing");
            }
        };
        fetchProductData();
    }
  }, [isEdit, productId, token]);

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    const numPrice = Number(price);
    const numDiscount = Number(discountPrice);

    if (isNaN(numPrice) || numPrice <= 0) {
        toast.error("Price must be a valid positive number");
        return;
    }

    if (discountPrice !== "" && (isNaN(numDiscount) || numDiscount < 0 || numDiscount >= numPrice)) {
        toast.error("Discount price must be a valid positive number and less than the actual price");
        return;
    }

    try {
      const formData = new FormData()

      formData.append("name", name)
      formData.append("description", description)
      formData.append("price", price)
      formData.append("category", category)
      formData.append("subCategory", subCategory)
      formData.append("bestseller", bestseller)
      formData.append("sizes", JSON.stringify(sizes))
      formData.append("stock", stock)
      formData.append("discountPrice", discountPrice)
      formData.append("bankOffers", JSON.stringify(bankOffers.split(',').map(s => s.trim()).filter(s => s !== "")))

      if (isEdit) {
        formData.append("id", productId);
        formData.append("existingImages", JSON.stringify(existingImages));
      }

      image1 && formData.append("image1", image1)
      image2 && formData.append("image2", image2)
      image3 && formData.append("image3", image3)
      image4 && formData.append("image4", image4)

      const endpoint = isEdit ? "/api/product/update" : "/api/product/add";
      const response = await axios.post(backendUrl + endpoint, formData, { headers: { token } })

      if (response.data.success) {
        toast.success(response.data.message)
        if (isEdit) {
            navigate('/admin/list');
        } else {
            setName('')
            setDescription('')
            setImage1(false)
            setImage2(false)
            setImage3(false)
            setImage4(false)
            setPrice('')
            setStock(10)
            setDiscountPrice('')
            setBankOffers('')
        }
      } else {
        toast.error(response.data.message)
      }

    } catch (error) {
      console.log(error);
      toast.error(error.message)
    }
  }

  return (
    <form onSubmit={onSubmitHandler} className='flex flex-col w-full items-start gap-3'>
      <div className='flex items-center justify-between w-full mb-4'>
          <p className='font-medium prata-regular text-2xl'>{isEdit ? 'Edit Product' : 'Add New Product'}</p>
          {isEdit && (
              <button type="button" onClick={() => navigate('/admin/list')} className='bg-gray-100 px-4 py-2 rounded-lg text-sm font-medium'>Cancel</button>
          )}
      </div>

      <div className='flex flex-col gap-2 w-full'>
        <p className='mb-2 font-medium prata-regular text-xl'>Upload Image</p>

        <div className='flex gap-2'>
          <label htmlFor="image1">
            <img 
                className='w-24 h-24 object-cover cursor-pointer border-2 border-dashed p-1 bg-gray-50' 
                src={image1 ? URL.createObjectURL(image1) : (isEdit && existingImages[0] ? existingImages[0] : assets.upload_area)} 
                alt="" 
            />
            <input onChange={(e) => setImage1(e.target.files[0])} type="file" id="image1" hidden />
          </label>
          <label htmlFor="image2">
            <img 
                className='w-24 h-24 object-cover cursor-pointer border-2 border-dashed p-1 bg-gray-50' 
                src={image2 ? URL.createObjectURL(image2) : (isEdit && existingImages[1] ? existingImages[1] : assets.upload_area)} 
                alt="" 
            />
            <input onChange={(e) => setImage2(e.target.files[0])} type="file" id="image2" hidden />
          </label>
          <label htmlFor="image3">
            <img 
                className='w-24 h-24 object-cover cursor-pointer border-2 border-dashed p-1 bg-gray-50' 
                src={image3 ? URL.createObjectURL(image3) : (isEdit && existingImages[2] ? existingImages[2] : assets.upload_area)} 
                alt="" 
            />
            <input onChange={(e) => setImage3(e.target.files[0])} type="file" id="image3" hidden />
          </label>
          <label htmlFor="image4">
            <img 
                className='w-24 h-24 object-cover cursor-pointer border-2 border-dashed p-1 bg-gray-50' 
                src={image4 ? URL.createObjectURL(image4) : (isEdit && existingImages[3] ? existingImages[3] : assets.upload_area)} 
                alt="" 
            />
            <input onChange={(e) => setImage4(e.target.files[0])} type="file" id="image4" hidden />
          </label>
        </div>
      </div>

      <div className='w-full'>
        <p className='mb-2 font-medium'>Product Name</p>
        <input onChange={(e) => setName(e.target.value)} value={name} className='w-full max-w-[500px] px-3 py-2 border border-black outline-none' type="text" placeholder='Type here' required />
      </div>

      <div className='w-full'>
        <p className='mb-2 font-medium'>Product Description</p>
        <textarea onChange={(e) => setDescription(e.target.value)} value={description} className='w-full max-w-[500px] px-3 py-2 border border-black outline-none' type="text" placeholder='Write content here' required />
      </div>

      <div className='flex flex-col sm:flex-row gap-2 w-full sm:gap-8'>

        <div>
          <p className='mb-2 font-medium'>Product Category</p>
          <select onChange={(e) => setCategory(e.target.value)} className='w-full px-3 py-2 border border-black outline-none'>
            <option value="Men">Men</option>
            <option value="Women">Women</option>
            <option value="Kids">Kids</option>
          </select>
        </div>

        <div>
          <p className='mb-2 font-medium'>Sub Category</p>
          <select onChange={(e) => setSubCategory(e.target.value)} className='w-full px-3 py-2 border border-black outline-none'>
            <option value="Topwear">Topwear</option>
            <option value="Bottomwear">Bottomwear</option>
            <option value="Winterwear">Winterwear</option>
          </select>
        </div>

        <div>
          <p className='mb-2 font-medium'>Price</p>
          <input onChange={(e) => setPrice(e.target.value)} value={price} className='w-full px-3 py-2 sm:w-[120px] border border-black outline-none' type="Number" placeholder='25' />
        </div>

        <div>
          <p className='mb-2 font-medium bg-red-50 px-2 py-0.5 rounded text-red-600 inline-block'>Discount Price</p>
          <input onChange={(e) => setDiscountPrice(e.target.value)} value={discountPrice} className='w-full px-3 py-2 sm:w-[120px] border border-red-200 outline-none block mt-1' type="Number" placeholder='20' />
        </div>

        <div>
          <p className='mb-2 font-medium'>Stock Quantity</p>
          <input onChange={(e) => setStock(e.target.value)} value={stock} className='w-full px-3 py-2 sm:w-[120px] border border-black outline-none' type="Number" placeholder='10' />
        </div>

      </div>

      <div className='w-full'>
        <p className='mb-2 font-medium'>Bank & Card Offers (Comma separated)</p>
        <textarea 
            onChange={(e) => setBankOffers(e.target.value)} 
            value={bankOffers} 
            className='w-full max-w-[500px] px-3 py-2 border border-black outline-none' 
            placeholder='10% off on SBI Cards, 5% Cashback on ICICI cards...' 
        />
      </div>

      <div>
        <p className='mb-2 font-medium'>Product Sizes</p>
        <div className='flex gap-3'>
          <div onClick={() => setSizes(prev => prev.includes("S") ? prev.filter(item => item !== "S") : [...prev, "S"])}>
            <p className={`${sizes.includes("S") ? "bg-black text-white" : "bg-gray-100"} px-3 py-1 cursor-pointer border`}>S</p>
          </div>

          <div onClick={() => setSizes(prev => prev.includes("M") ? prev.filter(item => item !== "M") : [...prev, "M"])}>
            <p className={`${sizes.includes("M") ? "bg-black text-white" : "bg-gray-100"} px-3 py-1 cursor-pointer border`}>M</p>
          </div>

          <div onClick={() => setSizes(prev => prev.includes("L") ? prev.filter(item => item !== "L") : [...prev, "L"])}>
            <p className={`${sizes.includes("L") ? "bg-black text-white" : "bg-gray-100"} px-3 py-1 cursor-pointer border`}>L</p>
          </div>

          <div onClick={() => setSizes(prev => prev.includes("XL") ? prev.filter(item => item !== "XL") : [...prev, "XL"])}>
            <p className={`${sizes.includes("XL") ? "bg-black text-white" : "bg-gray-100"} px-3 py-1 cursor-pointer border`}>XL</p>
          </div>

          <div onClick={() => setSizes(prev => prev.includes("XXL") ? prev.filter(item => item !== "XXL") : [...prev, "XXL"])}>
            <p className={`${sizes.includes("XXL") ? "bg-black text-white" : "bg-gray-100"} px-3 py-1 cursor-pointer border`}>XXL</p>
          </div>
        </div>
      </div>

      <div className='flex gap-2 mt-2'>
        <input onChange={() => setBestseller(prev => !prev)} checked={bestseller} type="checkbox" id='bestseller' className='accent-black' />
        <label className='cursor-pointer text-sm font-medium' htmlFor="bestseller">Add to bestseller</label>
      </div>

      <button type="submit" className='min-w-[130px] py-3 mt-4 bg-black text-white active:bg-gray-800 transition-colors font-medium rounded-lg shadow-lg'>
          {isEdit ? 'UPDATE PRODUCT' : 'ADD PRODUCT'}
      </button>

    </form>
  )
}

export default AdminAdd
