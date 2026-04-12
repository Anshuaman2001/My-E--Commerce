import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import userModel from "../models/user.model.js";
import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);


const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET)
}

// Function to get Google OAuth Client lazily
const getGoogleClient = () => {
    if (!process.env.GOOGLE_CLIENT_ID) {
        throw new Error("GOOGLE_CLIENT_ID is not defined in environment variables");
    }
    return new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
}

// Route for user login
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await userModel.findOne({ email });

        if (!user) {
            return res.json({ success: false, message: "User doesn't exists" })
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
            // Check if user is an admin trying to login from customer portal
            if (user.role === 'admin') {
                return res.json({ success: false, message: "Admin accounts must use the Admin Panel login." })
            }
            const token = createToken(user._id)
            res.json({ success: true, token, user: { name: user.name, email: user.email, image: user.image, role: user.role } })
        }
        else {
            res.json({ success: false, message: 'Invalid credentials' })
        }

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }
}

// Route for user registration
const registerUser = async (req, res) => {
    try {

        const { name, email, password } = req.body;

        // checking user already exists or not
        const exists = await userModel.findOne({ email });
        if (exists) {
            return res.json({ success: false, message: "User already exists" })
        }

        // validating email format & strong password
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Please enter a valid email" })
        }
        if (password.length < 8) {
            return res.json({ success: false, message: "Please enter a strong password" })
        }

        // hashing user password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const newUser = new userModel({
            name,
            email,
            password: hashedPassword
        })

        const user = await newUser.save()

        const token = createToken(user._id)

        res.json({ success: true, token, user: { name: user.name, email: user.email, role: user.role } })

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }
}

// Route for admin login
const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            // Find or create the admin user in the database
            let adminUser = await userModel.findOne({ email, role: 'admin' });
            
            if (!adminUser) {
                // Check if user exists as standard user and promote, or create new
                adminUser = await userModel.findOne({ email });
                if (adminUser) {
                    adminUser.role = 'admin';
                    await adminUser.save();
                } else {
                    const salt = await bcrypt.genSalt(10);
                    const hashedPassword = await bcrypt.hash(password, salt);
                    adminUser = new userModel({
                        name: "Admin User",
                        email,
                        password: hashedPassword,
                        role: 'admin'
                    });
                    await adminUser.save();
                }
            }

            const token = createToken(adminUser._id);
            res.json({ success: true, token, user: { name: adminUser.name, email: adminUser.email, role: adminUser.role } })
        } else {
            res.json({ success: false, message: "Invalid credentials" })
        }

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }
}


// Route for Google login
const googleLogin = async (req, res) => {
    try {
        const { idToken } = req.body;
        
        if (!idToken) {
            return res.json({ success: false, message: "Google ID Token is missing" });
        }

        const client = getGoogleClient();
        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const { name, email, picture } = ticket.getPayload();

        let user = await userModel.findOne({ email });

        if (!user) {
            // Create a new user if not exists
            const password = Math.random().toString(36).slice(-8);
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            
            user = new userModel({
                name,
                email,
                password: hashedPassword,
                image: picture,
                role: 'user' // Explicitly set role for new Google users
            });
            await user.save();
        } else {
            // Check if existing user is an admin
            if (user.role === 'admin') {
                return res.json({ success: false, message: "Admin accounts must use the Admin Panel login, not Google login." });
            }

            if (picture && !user.image) {
                // Update image if it was missing
                user.image = picture;
                await user.save();
            }
        }

        const token = createToken(user._id);
        res.json({ success: true, token, user: { name: user.name, email: user.email, image: user.image, role: user.role } });
    } catch (error) {
        console.error("Google Login Error:", error);
        res.json({ success: false, message: error.message || "Google Authentication failed" });
    }
}

// Add Address
const addAddress = async (req, res) => {
    try {
        const { userId, address } = req.body;
        const user = await userModel.findById(userId);
        let addressData = user.addressData || [];
        addressData.push(address);
        await userModel.findByIdAndUpdate(userId, { addressData });
        res.json({ success: true, message: "Address Added" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// Delete Address
const deleteAddress = async (req, res) => {
    try {
        const { userId, index } = req.body;
        const user = await userModel.findById(userId);
        let addressData = user.addressData || [];
        if (addressData.length > index) {
            addressData.splice(index, 1);
            await userModel.findByIdAndUpdate(userId, { addressData });
        }
        res.json({ success: true, message: "Address Deleted" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// Get User Addresses
const getUserAddresses = async (req, res) => {
    try {
        const { userId } = req.body;
        const user = await userModel.findById(userId);
        res.json({ success: true, addressData: user.addressData || [] });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// Toggle Wishlist
const toggleWishlist = async (req, res) => {
    try {
        const { userId, productId } = req.body;
        const user = await userModel.findById(userId);
        let wishlistData = user.wishlistData || [];
        
        const index = wishlistData.indexOf(productId);
        if (index === -1) {
            wishlistData.push(productId);
            await userModel.findByIdAndUpdate(userId, { wishlistData });
            res.json({ success: true, message: "Added to Wishlist", wishlistData });
        } else {
            wishlistData.splice(index, 1);
            await userModel.findByIdAndUpdate(userId, { wishlistData });
            res.json({ success: true, message: "Removed from Wishlist", wishlistData });
        }
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// Get User Wishlist
const getWishlist = async (req, res) => {
    try {
        const { userId } = req.body;
        const user = await userModel.findById(userId);
        res.json({ success: true, wishlistData: user.wishlistData || [] });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

export { loginUser, registerUser, adminLogin, googleLogin, addAddress, deleteAddress, getUserAddresses, toggleWishlist, getWishlist }
