import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from 'axios'
import { products as localProducts } from "../assets/assets";

export const ShopContext = createContext();

const ShopContextProvider = (props) => {

    const currency = '₹';
    const delivery_fee = 10;
    const backendUrl = import.meta.env.VITE_BACKEND_URL
    const [search, setSearch] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [cartItems, setCartItems] = useState({});
    const [products, setProducts] = useState([]);
    const [token, setToken] = useState('')
    const [userData, setUserData] = useState(localStorage.getItem('userData') ? JSON.parse(localStorage.getItem('userData')) : null)
    const [addressList, setAddressList] = useState([])
    const [wishlist, setWishlist] = useState([])
    const [userTickets, setUserTickets] = useState([])
    const navigate = useNavigate();

    const addAddress = async (address) => {
        if (token) {
            try {
                const response = await axios.post(backendUrl + '/api/user/address/add', { address }, { headers: { token } })
                if (response.data.success) {
                    toast.success(response.data.message)
                    getAddressList()
                } else {
                    toast.error(response.data.message)
                }
            } catch (error) {
                console.log(error)
                toast.error(error.message)
            }
        }
    }

    const deleteAddress = async (index) => {
        if (token) {
            try {
                const response = await axios.post(backendUrl + '/api/user/address/delete', { index }, { headers: { token } })
                if (response.data.success) {
                    toast.success(response.data.message)
                    getAddressList()
                } else {
                    toast.error(response.data.message)
                }
            } catch (error) {
                console.log(error)
                toast.error(error.message)
            }
        }
    }

    const getAddressList = async () => {
        if (token) {
            try {
                const response = await axios.post(backendUrl + '/api/user/address/list', {}, { headers: { token } })
                if (response.data.success) {
                    setAddressList(response.data.addressData)
                }
            } catch (error) {
                console.log(error)
            }
        }
    }

    const toggleWishlist = async (productId) => {
        if (!token) {
            toast.info('Please login to use wishlist')
            navigate('/login')
            return
        }

        // Optimistic Update
        const prevWishlist = [...wishlist];
        const isAdded = wishlist.includes(productId);
        
        let newWishlist;
        if (isAdded) {
            newWishlist = wishlist.filter(id => id !== productId);
        } else {
            newWishlist = [...wishlist, productId];
        }
        
        setWishlist(newWishlist);

        try {
            const response = await axios.post(backendUrl + '/api/user/wishlist/toggle', { productId }, { headers: { token } })
            if (response.data.success) {
                toast.success(response.data.message)
                // Sync state with backend's source of truth if provided
                if (response.data.wishlistData) {
                    setWishlist(response.data.wishlistData);
                }
            } else {
                // Revert if backend says no
                setWishlist(prevWishlist);
                toast.error(response.data.message)
            }
        } catch (error) {
            console.log(error)
            // Revert on network error
            setWishlist(prevWishlist);
            toast.error(error.message)
        }
    }

    const getWishlistData = async () => {
        if (token) {
            try {
                const response = await axios.get(backendUrl + '/api/user/wishlist/get', { headers: { token } })
                if (response.data.success) {
                    setWishlist(response.data.wishlistData)
                }
            } catch (error) {
                console.log(error)
            }
        }
    }


    const addToCart = async (itemId, size) => {

        if (!size) {
            toast.error('Select Product Size');
            return;
        }

        let cartData = structuredClone(cartItems);

        if (cartData[itemId]) {
            if (cartData[itemId][size]) {
                cartData[itemId][size] += 1;
            }
            else {
                cartData[itemId][size] = 1;
            }
        }
        else {
            cartData[itemId] = {};
            cartData[itemId][size] = 1;
        }
        setCartItems(cartData);
        toast.success('Added to cart');

        if (token) {
            try {
                await axios.post(backendUrl + '/api/cart/add', { itemId, size }, { headers: { token } })
            } catch (error) {
                console.log(error)
                toast.error(error.message)
            }
        }

    }

    const getCartCount = () => {
        let totalCount = 0;
        for (const items in cartItems) {
            for (const item in cartItems[items]) {
                try {
                    if (cartItems[items][item] > 0) {
                        totalCount += cartItems[items][item];
                    }
                } catch (error) {

                }
            }
        }
        return totalCount;
    }

    const getProductQuantity = (itemId) => {
        let totalCount = 0;
        if (cartItems[itemId]) {
            for (const size in cartItems[itemId]) {
                if (cartItems[itemId][size] > 0) {
                    totalCount += cartItems[itemId][size];
                }
            }
        }
        return totalCount;
    }

    const getWishlistCount = () => {
        let count = 0;
        wishlist.forEach((id) => {
            if (products.find(p => p._id === id)) {
                count++;
            }
        });
        return count;
    }

    const updateQuantity = async (itemId, size, quantity) => {

        let cartData = structuredClone(cartItems);

        cartData[itemId][size] = quantity;

        setCartItems(cartData);

        if (token) {
            try {
                await axios.post(backendUrl + '/api/cart/update', { itemId, size, quantity }, { headers: { token } })
            } catch (error) {
                console.log(error)
                toast.error(error.message)
            }
        }

    }

    const getCartAmount = () => {
        let totalAmount = 0;
        for (const items in cartItems) {
            let itemInfo = products.find((product) => product._id === items);
            if (itemInfo) {
                for (const item in cartItems[items]) {
                    try {
                        if (cartItems[items][item] > 0) {
                            totalAmount += itemInfo.price * cartItems[items][item];
                        }
                    } catch (error) {

                    }
                }
            }
        }
        return totalAmount;
    }

    const getUserTickets = async () => {
        if (token) {
            try {
                const response = await axios.post(backendUrl + '/api/chat/user-tickets', {}, { headers: { token } })
                if (response.data.success) {
                    setUserTickets(response.data.tickets)
                }
            } catch (error) {
                console.log(error)
            }
        }
    }

    const getProductsData = async () => {
        try {
            const response = await axios.get(backendUrl + '/api/product/list')
            if (response.data.success && response.data.products.length > 0) {
                setProducts(response.data.products.reverse())
            } else {
                // Fallback to local data while DB is empty
                setProducts(localProducts)
            }
        } catch (error) {
            console.log(error)
            // Fallback to local data if backend is unreachable
            setProducts(localProducts)
        }
    }

    const getUserCart = async (token) => {
        try {
            const response = await axios.post(backendUrl + '/api/cart/get', {}, { headers: { token } })
            if (response.data.success) {
                setCartItems(response.data.cartData)
            }
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        getProductsData()
    }, [])

    useEffect(() => {
        if (!token && localStorage.getItem('token')) {
            setToken(localStorage.getItem('token'))
            getUserCart(localStorage.getItem('token'))
        }
        if (token) {
            getUserCart(token)
            getAddressList()
            getWishlistData()
            getUserTickets()
        }
    }, [token])

    const value = {
        products, currency, delivery_fee,
        search, setSearch, showSearch, setShowSearch,
        cartItems, addToCart, setCartItems,
        getCartCount, updateQuantity,
        getCartAmount, backendUrl, token, setToken,
        navigate, userData, setUserData,
        addressList, addAddress, deleteAddress, getAddressList,
        wishlist, toggleWishlist, getWishlistData,
        getProductQuantity, getWishlistCount,
        userTickets, getUserTickets
    }

    return (
        <ShopContext.Provider value={value}>
            {props.children}
        </ShopContext.Provider>
    )
}

export default ShopContextProvider;