import express from 'express';
import { loginUser, registerUser, adminLogin, googleLogin, addAddress, deleteAddress, getUserAddresses, toggleWishlist, getWishlist } from '../controllers/user.controller.js';
import authUser from '../middleware/auth.js';

const userRouter = express.Router();

userRouter.post('/register', registerUser)
userRouter.post('/login', loginUser)
userRouter.post('/admin', adminLogin)
userRouter.post('/google-login', googleLogin)

userRouter.post('/address/add', authUser, addAddress)
userRouter.post('/address/delete', authUser, deleteAddress)
userRouter.post('/address/list', authUser, getUserAddresses)

userRouter.post('/wishlist/toggle', authUser, toggleWishlist)
userRouter.get('/wishlist/get', authUser, getWishlist)

export default userRouter;
