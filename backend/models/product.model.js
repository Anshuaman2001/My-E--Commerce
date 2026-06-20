import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: Array, required: true },
    category: { type: String, required: true },
    subCategory: { type: String, required: true },
    sizes: { type: Array, required: true },
    bestseller: { type: Boolean },
    stock: { type: Number, default: 10 },
    discountPrice: { type: Number },
    bankOffers: { type: Array, default: [] },
    reviews: { type: Array, default: [] },   // [{userId, name, rating, comment, date, verified, media:[{type,url}], socialLink}]
    questions: { type: Array, default: [] }, // [{userId, name, question, date, answers:[{userId,name,answer,date,isAdmin,isVerifiedBuyer}]}]
    date: { type: Number, required: true }
})

const productModel = mongoose.models.product || mongoose.model("product", productSchema);

export default productModel;
