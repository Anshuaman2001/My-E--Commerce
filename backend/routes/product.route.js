import express from 'express';
import { listProducts, addProduct, removeProduct, singleProduct, addReview, updateProduct, checkPurchase, addQuestion, addAnswer, deleteReview, deleteQuestion, deleteAnswer } from '../controllers/product.controller.js'
import upload from '../middleware/multer.js';
import adminAuth from '../middleware/adminAuth.js';
import authUser from '../middleware/auth.js';

const productRouter = express.Router();

// Admin: add / update / remove products
productRouter.post('/add', adminAuth, upload.fields([{ name: 'image1', maxCount: 1 }, { name: 'image2', maxCount: 1 }, { name: 'image3', maxCount: 1 }, { name: 'image4', maxCount: 1 }]), addProduct);
productRouter.post('/update', adminAuth, upload.fields([{ name: 'image1', maxCount: 1 }, { name: 'image2', maxCount: 1 }, { name: 'image3', maxCount: 1 }, { name: 'image4', maxCount: 1 }]), updateProduct);
productRouter.post('/remove', adminAuth, removeProduct);

// Admin: Reviews & Q&A moderation
productRouter.post('/delete-review', adminAuth, deleteReview);
productRouter.post('/delete-question', adminAuth, deleteQuestion);
productRouter.post('/delete-answer', adminAuth, deleteAnswer);

// Public product endpoints
productRouter.post('/single', singleProduct);
productRouter.get('/list', listProducts);

// Reviews — verified buyers only, supports media upload
productRouter.post(
    '/add-review',
    authUser,
    upload.fields([
        { name: 'reviewMedia', maxCount: 5 },  // up to 5 images
        { name: 'reviewVideo', maxCount: 1 },   // 1 short video file
    ]),
    addReview
);

// Check if logged-in user has purchased the product
productRouter.post('/check-purchase', authUser, checkPurchase);

// Q&A — any logged-in user can ask
productRouter.post('/add-question', authUser, addQuestion);

// Q&A — admin or verified buyer can answer
productRouter.post('/add-answer', authUser, addAnswer);

export default productRouter;
