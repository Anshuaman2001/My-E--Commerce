import mongoose from "mongoose";

const connectDB = async () => {
    try {
        mongoose.connection.on('connected', () => {
            console.log("✅ DB Connected");
        })
        mongoose.connection.on('error', (err) => {
            console.log("❌ DB Error:", err.message);
        })

        await mongoose.connect(`${process.env.MONGODB_URI}/forever`)
    } catch (error) {
        console.log("⚠️  MongoDB connection failed:", error.message);
        console.log("   Server running without database. DB features will not work.");
        console.log("   → Fix: Whitelist your IP in MongoDB Atlas → Network Access");
    }
}

export default connectDB;
