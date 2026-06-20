import { v2 as cloudinary } from "cloudinary"
import mongoose from "mongoose"
import productModel from "../models/product.model.js"
import orderModel from "../models/order.model.js"
import userModel from "../models/user.model.js"

// function for add product
const addProduct = async (req, res) => {
    try {

        const { name, description, price, category, subCategory, sizes, bestseller, discountPrice, bankOffers } = req.body

        const image1 = req.files.image1 && req.files.image1[0]
        const image2 = req.files.image2 && req.files.image2[0]
        const image3 = req.files.image3 && req.files.image3[0]
        const image4 = req.files.image4 && req.files.image4[0]

        const images = [image1, image2, image3, image4].filter((item) => item !== undefined)

        let imagesUrl = await Promise.all(
            images.map(async (item) => {
                let result = await cloudinary.uploader.upload(item.path, { resource_type: 'image' });
                return result.secure_url
            })
        )

        const productData = {
            name,
            description,
            category,
            price: Number(price),
            subCategory,
            bestseller: bestseller === "true" ? true : false,
            sizes: JSON.parse(sizes),
            image: imagesUrl,
            stock: req.body.stock ? Number(req.body.stock) : 10,
            discountPrice: discountPrice ? Number(discountPrice) : undefined,
            bankOffers: bankOffers ? JSON.parse(bankOffers) : [],
            date: Date.now()
        }

        console.log(productData);

        const product = new productModel(productData);
        await product.save()

        res.json({ success: true, message: "Product Added" })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// function for update product
const updateProduct = async (req, res) => {
    try {
        const { id, name, description, price, category, subCategory, sizes, bestseller, stock, discountPrice, bankOffers, existingImages } = req.body;

        const image1 = req.files.image1 && req.files.image1[0]
        const image2 = req.files.image2 && req.files.image2[0]
        const image3 = req.files.image3 && req.files.image3[0]
        const image4 = req.files.image4 && req.files.image4[0]

        const newImages = [image1, image2, image3, image4].filter((item) => item !== undefined)
        
        let imagesUrl = existingImages ? JSON.parse(existingImages) : [];

        if (newImages.length > 0) {
            const uploadedImages = await Promise.all(
                newImages.map(async (item) => {
                    let result = await cloudinary.uploader.upload(item.path, { resource_type: 'image' });
                    return result.secure_url
                })
            )
            imagesUrl = [...imagesUrl, ...uploadedImages];
        }

        const updatedData = {
            name,
            description,
            category,
            price: Number(price),
            subCategory,
            bestseller: bestseller === "true" ? true : false,
            sizes: JSON.parse(sizes),
            image: imagesUrl,
            stock: Number(stock),
            discountPrice: discountPrice ? Number(discountPrice) : undefined,
            bankOffers: bankOffers ? JSON.parse(bankOffers) : []
        }

        await productModel.findByIdAndUpdate(id, updatedData);

        res.json({ success: true, message: "Product Updated" })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// function for list product
const listProducts = async (req, res) => {
    try {
        const products = await productModel.find({});
        res.json({ success: true, products })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// function for removing product
const removeProduct = async (req, res) => {
    try {
        await productModel.findByIdAndDelete(req.body.id)
        res.json({ success: true, message: "Product Removed" })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// function for single product info
const singleProduct = async (req, res) => {
    try {
        const { productId } = req.body
        const product = await productModel.findById(productId)
        res.json({ success: true, product })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// ── Helper: check if user bought the product (has a delivered order) ──────────
const userHasBoughtProduct = async (userId, productId) => {
    const orders = await orderModel.find({ userId, status: 'Delivered' });
    return orders.some(order =>
        order.items.some(item => String(item._id) === String(productId))
    );
};

// Check if logged-in user has purchased this product
const checkPurchase = async (req, res) => {
    try {
        const { productId, userId } = req.body;
        const purchased = await userHasBoughtProduct(userId, productId);
        res.json({ success: true, purchased });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Add a review (only verified buyers)
const addReview = async (req, res) => {
    try {
        const { productId, rating, comment, name, userId, socialLink, videoLink } = req.body;

        // ── 1. Verify purchase ─────────────────────────────────────────────
        const purchased = await userHasBoughtProduct(userId, productId);
        if (!purchased) {
            return res.json({ success: false, message: 'Only verified buyers can review this product' });
        }

        const product = await productModel.findById(productId);
        if (!product) return res.json({ success: false, message: 'Product not found' });

        // ── 2. Prevent duplicate reviews ───────────────────────────────────
        const alreadyReviewed = product.reviews.some(r => String(r.userId) === String(userId));
        if (alreadyReviewed) {
            return res.json({ success: false, message: 'You have already reviewed this product' });
        }

        // ── 3. Upload media files to Cloudinary ────────────────────────────
        const media = [];

        // Upload image attachments (reviewMedia field, up to 5)
        if (req.files?.reviewMedia) {
            for (const file of req.files.reviewMedia) {
                const result = await cloudinary.uploader.upload(file.path, {
                    resource_type: 'image',
                    folder: 'reviews',
                });
                media.push({ type: 'image', url: result.secure_url });
            }
        }

        // Upload video file (reviewVideo field, 1 file)
        if (req.files?.reviewVideo?.[0]) {
            const file = req.files.reviewVideo[0];
            const result = await cloudinary.uploader.upload(file.path, {
                resource_type: 'video',
                folder: 'reviews',
                transformation: [{ duration: 15 }], // Trim to 15s on Cloudinary
            });
            media.push({ type: 'video', url: result.secure_url });
        }

        // Add video link (YouTube / Instagram / etc.)
        if (videoLink && videoLink.trim()) {
            media.push({ type: 'videoLink', url: videoLink.trim() });
        }

        // ── 4. Save review ─────────────────────────────────────────────────
        const newReview = {
            _id: new mongoose.Types.ObjectId(),
            userId,
            name,
            rating: Number(rating),
            comment,
            date: Date.now(),
            verified: true,
            media,
            socialLink: socialLink?.trim() || '',
        };

        product.reviews.push(newReview);
        await product.save();

        res.json({ success: true, message: 'Review submitted! Thank you.' });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Add a question (any logged-in user)
const addQuestion = async (req, res) => {
    try {
        const { productId, question, name, userId } = req.body;

        if (!question?.trim()) return res.json({ success: false, message: 'Question cannot be empty' });

        const product = await productModel.findById(productId);
        if (!product) return res.json({ success: false, message: 'Product not found' });

        product.questions.push({
            _id: new mongoose.Types.ObjectId(),
            userId,
            name,
            question: question.trim(),
            date: Date.now(),
            answers: [],
        });

        await product.save();
        res.json({ success: true, message: 'Question posted!' });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Add an answer to a question (admin OR verified buyer)
const addAnswer = async (req, res) => {
    try {
        const { productId, questionId, answer, name, userId } = req.body;

        if (!answer?.trim()) return res.json({ success: false, message: 'Answer cannot be empty' });

        // Check if admin
        const user = await userModel.findById(userId);
        const isAdmin = user?.role === 'admin';

        // Check if verified buyer (if not admin)
        let isVerifiedBuyer = false;
        if (!isAdmin) {
            isVerifiedBuyer = await userHasBoughtProduct(userId, productId);
            if (!isVerifiedBuyer) {
                return res.json({ success: false, message: 'Only admins or verified buyers can answer questions' });
            }
        }

        const product = await productModel.findById(productId);
        if (!product) return res.json({ success: false, message: 'Product not found' });

        // Find question by _id or index
        const question = product.questions.find(q => String(q._id || q.date) === String(questionId));
        if (!question) return res.json({ success: false, message: 'Question not found' });

        question.answers.push({
            _id: new mongoose.Types.ObjectId(),
            userId,
            name,
            answer: answer.trim(),
            date: Date.now(),
            isAdmin,
            isVerifiedBuyer,
        });

        await product.save();
        res.json({ success: true, message: 'Answer posted!' });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Delete Review (Admin only)
const deleteReview = async (req, res) => {
    try {
        const { productId, reviewId } = req.body;
        const product = await productModel.findById(productId);
        if (!product) return res.json({ success: false, message: 'Product not found' });

        // Filter out the review matching reviewId or fallback to date (stored as reviewId on old reviews)
        const initialLen = product.reviews.length;
        product.reviews = product.reviews.filter(r => String(r._id || r.date) !== String(reviewId));

        if (product.reviews.length === initialLen) {
            return res.json({ success: false, message: 'Review not found' });
        }

        await product.save();
        res.json({ success: true, message: 'Review deleted successfully' });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Delete Question (Admin only)
const deleteQuestion = async (req, res) => {
    try {
        const { productId, questionId } = req.body;
        const product = await productModel.findById(productId);
        if (!product) return res.json({ success: false, message: 'Product not found' });

        const initialLen = product.questions.length;
        product.questions = product.questions.filter(q => String(q._id || q.date) !== String(questionId));

        if (product.questions.length === initialLen) {
            return res.json({ success: false, message: 'Question not found' });
        }

        await product.save();
        res.json({ success: true, message: 'Question deleted successfully' });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Delete Answer (Admin only)
const deleteAnswer = async (req, res) => {
    try {
        const { productId, questionId, answerId } = req.body;
        const product = await productModel.findById(productId);
        if (!product) return res.json({ success: false, message: 'Product not found' });

        const question = product.questions.find(q => String(q._id || q.date) === String(questionId));
        if (!question) return res.json({ success: false, message: 'Question not found' });

        const initialLen = question.answers.length;
        question.answers = question.answers.filter(a => String(a._id || a.date) !== String(answerId));

        if (question.answers.length === initialLen) {
            return res.json({ success: false, message: 'Answer not found' });
        }

        product.markModified('questions');
        await product.save();
        res.json({ success: true, message: 'Answer deleted successfully' });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

export { listProducts, addProduct, removeProduct, singleProduct, addReview, updateProduct, checkPurchase, addQuestion, addAnswer, deleteReview, deleteQuestion, deleteAnswer }

