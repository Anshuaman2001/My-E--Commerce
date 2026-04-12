import mongoose from "mongoose";

const connectCloudinary = async () => {
    try {
        const { v2: cloudinary } = await import("cloudinary");
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_SECRET_KEY
        });
        console.log("✅ Cloudinary Connected");
    } catch (error) {
        console.log("⚠️  Cloudinary setup skipped:", error.message);
    }
}

export default connectCloudinary;
