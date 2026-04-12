import jwt from "jsonwebtoken";

const adminAuth = async (req, res, next) => {
    try {
        const { token } = req.headers
        if (!token) {
            return res.json({ success: false, message: "Not Authorized Login Again" })
        }
        
        const token_decode = jwt.verify(token, process.env.JWT_SECRET);
        
        // In the new system, we expect the token to be a standard user token
        // Let's check the database for the user's role
        const userModel = (await import('../models/user.model.js')).default;
        const user = await userModel.findById(token_decode.id);

        if (!user || user.role !== 'admin') {
            return res.json({ success: false, message: "Not Authorized Login Again" })
        }
        
        next()
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

export default adminAuth
