import React, { useContext, useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import Title from '../components/Title'
import CartTotal from '../components/CartTotal'
import { assets } from '../assets/assets'
import { ShopContext } from '../context/ShopContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import OrderButton from '../components/OrderButton'
import { Zap, ShoppingBag } from 'lucide-react'

const PlaceOrder = () => {

    const [method, setMethod] = useState('cod');
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);
    const { navigate, backendUrl, token, cartItems, setCartItems, getCartAmount, delivery_fee, products, addressList, getCartCount, currency } = useContext(ShopContext);
    const [searchParams] = useSearchParams();

    // ── Buy Now Mode ────────────────────────────────────────
    const isBuyNow = searchParams.get('buynow') === '1';
    const [buyNowItem, setBuyNowItem] = useState(null);

    useEffect(() => {
        if (isBuyNow) {
            const stored = sessionStorage.getItem('buyNowItem');
            if (stored) {
                setBuyNowItem(JSON.parse(stored));
            } else {
                // No buy-now item, go back
                navigate('/');
            }
        }
    }, [isBuyNow]);

    // Redirect if cart is empty (only in normal cart mode)
    React.useEffect(() => {
        if (!isBuyNow && !isPlacingOrder && getCartCount() === 0) {
            navigate('/cart');
        }
    }, [cartItems, isPlacingOrder, isBuyNow]);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        street: '',
        city: '',
        state: '',
        zipcode: '',
        country: 'India',
        phone: ''
    });

    const onSelectSavedAddress = (e) => {
        const index = e.target.value;
        if (index === '') return;
        const selected = addressList[index];
        setFormData({
            firstName: selected.firstName,
            lastName: selected.lastName,
            email: formData.email,
            street: selected.street,
            city: selected.city,
            state: selected.state,
            zipcode: selected.zipcode,
            country: selected.country,
            phone: selected.phone
        });
    };

    const onChangeHandler = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        setFormData(data => ({ ...data, [name]: value }));
    };

    // ── Compute totals ───────────────────────────────────────
    const getBuyNowAmount = () => {
        if (!buyNowItem) return 0;
        const price = buyNowItem.discountPrice || buyNowItem.price;
        return price * buyNowItem.quantity;
    };

    const getSubtotal = () => isBuyNow ? getBuyNowAmount() : getCartAmount();
    const getTotal = () => getSubtotal() === 0 ? 0 : getSubtotal() + delivery_fee;

    const onSubmitHandler = async (event) => {
        event.preventDefault();
        try {
            let orderItems = [];

            if (isBuyNow && buyNowItem) {
                // Single buy-now item
                orderItems = [{ ...buyNowItem }];
            } else {
                // Normal cart flow
                for (const items in cartItems) {
                    for (const item in cartItems[items]) {
                        if (cartItems[items][item] > 0) {
                            const itemInfo = structuredClone(products.find(product => product._id === items));
                            if (itemInfo) {
                                itemInfo.size = item;
                                itemInfo.quantity = cartItems[items][item];
                                orderItems.push(itemInfo);
                            }
                        }
                    }
                }
            }

            const orderData = {
                address: formData,
                items: orderItems,
                amount: getTotal()
            };

            switch (method) {
                case 'cod': {
                    const response = await axios.post(backendUrl + '/api/order/place', orderData, { headers: { token } });
                    if (response.data.success) {
                        setIsPlacingOrder(true);
                        sessionStorage.removeItem('buyNowItem');
                        setTimeout(() => {
                            if (!isBuyNow) setCartItems({});
                            navigate('/orders');
                        }, 11000);
                    } else {
                        toast.error(response.data.message);
                    }
                    break;
                }
                case 'stripe': {
                    const responseStripe = await axios.post(backendUrl + '/api/order/stripe', orderData, { headers: { token } });
                    if (responseStripe.data.success) {
                        sessionStorage.removeItem('buyNowItem');
                        const { session_url } = responseStripe.data;
                        window.location.replace(session_url);
                    } else {
                        toast.error(responseStripe.data.message);
                    }
                    break;
                }
                default:
                    break;
            }

        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    };

    return (
        <form onSubmit={onSubmitHandler} className='flex flex-col sm:flex-row justify-between gap-4 pt-5 sm:pt-14 min-h-[80vh] border-t'>
            {/* ------------- Left Side ---------------- */}
            <div className='flex flex-col gap-4 w-full sm:max-w-[480px]'>

                <div className='text-xl sm:text-2xl my-3 flex flex-col gap-4'>
                    <Title text1={'DELIVERY'} text2={'INFORMATION'} />

                    {addressList.length > 0 && (
                        <div className='w-full'>
                            <p className='text-sm text-gray-500 mb-2'>Select from Saved Addresses</p>
                            <select
                                onChange={onSelectSavedAddress}
                                className='border border-gray-300 rounded py-2 px-3 w-full text-sm outline-none focus:border-black transition-all'
                            >
                                <option value=''>-- Choose an Address --</option>
                                {addressList.map((addr, index) => (
                                    <option key={index} value={index}>
                                        {addr.label}: {addr.firstName} {addr.lastName}, {addr.street}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>
                <div className='flex gap-3'>
                    <input required onChange={onChangeHandler} name='firstName' value={formData.firstName} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type='text' placeholder='First name' />
                    <input required onChange={onChangeHandler} name='lastName' value={formData.lastName} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type='text' placeholder='Last name' />
                </div>
                <input required onChange={onChangeHandler} name='email' value={formData.email} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type='email' placeholder='Email address' />
                <input required onChange={onChangeHandler} name='street' value={formData.street} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type='text' placeholder='Street' />
                <div className='flex gap-3'>
                    <input required onChange={onChangeHandler} name='city' value={formData.city} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type='text' placeholder='City' />
                    <input required onChange={onChangeHandler} name='state' value={formData.state} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type='text' placeholder='State' />
                </div>
                <div className='flex gap-3'>
                    <input required onChange={onChangeHandler} name='zipcode' value={formData.zipcode} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type='number' placeholder='Zipcode' />
                    <input required onChange={onChangeHandler} name='country' value={formData.country} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type='text' placeholder='Country' />
                </div>
                <input required onChange={onChangeHandler} name='phone' value={formData.phone} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type='number' placeholder='Phone' />
            </div>

            {/* ------------- Right Side ------------------ */}
            <div className='mt-8'>

                {/* Buy Now item summary or Cart Total */}
                <div className='mt-8 min-w-80'>
                    {isBuyNow && buyNowItem ? (
                        <div className='w-full'>
                            <div className='text-2xl mb-4'>
                                <Title text1={'ORDER'} text2={'SUMMARY'} />
                            </div>
                            {/* Buy Now mode: show single item */}
                            <div className='flex items-center gap-4 bg-orange-50 border border-orange-100 rounded-xl p-4 mb-4'>
                                <div className='relative'>
                                    <img
                                        src={buyNowItem.image?.[0]}
                                        alt={buyNowItem.name}
                                        className='w-16 h-16 object-cover rounded-lg border border-orange-200'
                                    />
                                    <span className='absolute -top-1.5 -right-1.5 w-5 h-5 bg-orange-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center'>
                                        {buyNowItem.quantity}
                                    </span>
                                </div>
                                <div className='flex-1 min-w-0'>
                                    <p className='font-semibold text-gray-900 text-sm truncate'>{buyNowItem.name}</p>
                                    <p className='text-xs text-gray-500 mt-0.5'>Size: <strong>{buyNowItem.size}</strong></p>
                                    <p className='text-sm font-bold text-orange-600 mt-1'>
                                        {currency}{buyNowItem.discountPrice || buyNowItem.price}
                                    </p>
                                </div>
                                <div className='flex items-center gap-1 bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded-full'>
                                    <Zap size={10} className='fill-white' />
                                    BUY NOW
                                </div>
                            </div>

                            {/* Price breakdown */}
                            <div className='flex flex-col gap-2 text-sm'>
                                <div className='flex justify-between'>
                                    <p>Subtotal</p>
                                    <p>{currency} {getBuyNowAmount()}.00</p>
                                </div>
                                <hr />
                                <div className='flex justify-between'>
                                    <p>Shipping Fee</p>
                                    <p>{currency} {delivery_fee}.00</p>
                                </div>
                                <hr />
                                <div className='flex justify-between font-bold text-base'>
                                    <b>Total</b>
                                    <b>{currency} {getTotal()}.00</b>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <CartTotal />
                    )}
                </div>

                <div className='mt-12'>
                    <Title text1={'PAYMENT'} text2={'METHOD'} />
                    {/* --------------- Payment Method Selection ------------- */}
                    <div className='flex gap-3 flex-col lg:flex-row'>
                        <div onClick={() => setMethod('stripe')} className='flex items-center gap-3 border p-2 px-3 cursor-pointer'>
                            <p className={`min-w-3.5 h-3.5 border rounded-full ${method === 'stripe' ? 'bg-green-400' : ''}`}></p>
                            <img className='h-5 mx-4' src={assets.stripe_logo} alt='' />
                        </div>
                        <div onClick={() => setMethod('razorpay')} className='flex items-center gap-3 border p-2 px-3 cursor-pointer'>
                            <p className={`min-w-3.5 h-3.5 border rounded-full ${method === 'razorpay' ? 'bg-green-400' : ''}`}></p>
                            <img className='h-5 mx-4' src={assets.razorpay_logo} alt='' />
                        </div>
                        <div onClick={() => setMethod('cod')} className='flex items-center gap-3 border p-2 px-3 cursor-pointer'>
                            <p className={`min-w-3.5 h-3.5 border rounded-full ${method === 'cod' ? 'bg-green-400' : ''}`}></p>
                            <p className='text-gray-500 text-sm font-medium mx-4'>CASH ON DELIVERY</p>
                        </div>
                    </div>

                    <div className='w-full text-end mt-8 flex justify-end'>
                        <OrderButton type='submit' text={isBuyNow ? 'PLACE ORDER' : 'PLACE ORDER'} />
                    </div>
                </div>
            </div>
        </form>
    );
};

export default PlaceOrder;