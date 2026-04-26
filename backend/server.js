import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import path from 'path'
import { fileURLToPath } from 'url'
import connectDB from './config/mongodb.js'
import connectCloudinary from './config/cloudinary.js'
import userRouter from './routes/user.route.js'
import productRouter from './routes/product.route.js'
import orderRouter from './routes/order.route.js'
import cartRouter from './routes/cart.route.js'
import chatRouter from './routes/chat.route.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// App Config
const app = express();
const port = process.env.PORT || 4000;
connectDB();
connectCloudinary();

// middlewares
app.use(express.json());
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, curl, Postman)
        if (!origin) return callback(null, true);
        const allowedOrigins = [
            'http://localhost:5173',
            'http://localhost:5174',
            process.env.FRONTEND_URL,
            process.env.ADMIN_URL,
        ].filter(Boolean);
        // Allow all Vercel preview/production URLs for this project
        if (
            allowedOrigins.includes(origin) ||
            /\.vercel\.app$/.test(origin)
        ) {
            return callback(null, true);
        }
        callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
}));

// Serve product images from frontend assets folder
app.use('/images', express.static(path.join(__dirname, '../frontend/src/assets')));

// api endpoints
app.use('/api/user', userRouter)
app.use('/api/product', productRouter)
app.use('/api/order', orderRouter)
app.use('/api/cart', cartRouter)
app.use('/api/chat', chatRouter)

app.get('/', (req, res) => {
    res.send("API Working")
})

app.listen(port, () => console.log('Server started on PORT : ' + port))
