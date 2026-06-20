import orderModel from "../models/order.model.js";
import userModel from "../models/user.model.js";
import Stripe from 'stripe'

// global variables
const currency = 'inr'
const deliveryCharge = 10

// Pool of delivery partners for auto-assignment
const DELIVERY_PARTNERS = [
    { name: "Vikram Malhotra", phone: "+91 98765 01234", vehicle: "DL 3C AB 1234", company: "BlueDart", rating: "4.9", avatarSeed: "VM" },
    { name: "Amit Patel", phone: "+91 98234 56789", vehicle: "MH 12 CD 5678", company: "Delhivery", rating: "4.7", avatarSeed: "AP" },
    { name: "Rohan Sharma", phone: "+91 99112 23344", vehicle: "KA 03 EF 9012", company: "Shadowfax", rating: "4.8", avatarSeed: "RS" },
    { name: "Deepak Verma", phone: "+91 97890 12345", vehicle: "TN 09 GH 3456", company: "Ekart", rating: "4.6", avatarSeed: "DV" },
    { name: "Suresh Yadav", phone: "+91 96543 21098", vehicle: "RJ 14 KL 7890", company: "DTDC", rating: "4.8", avatarSeed: "SY" }
];

// Deterministically pick a delivery partner based on order ID
const pickDeliveryPartner = (orderId) => {
    let hash = 0;
    for (let i = 0; i < orderId.length; i++) {
        hash = orderId.charCodeAt(i) + ((hash << 5) - hash);
    }
    return DELIVERY_PARTNERS[Math.abs(hash) % DELIVERY_PARTNERS.length];
};

// Placing orders using COD Method
const placeOrder = async (req, res) => {
    try {
        const { userId, items, amount, address } = req.body;

        const itemsWithPins = items.map(item => ({
            ...item,
            pin: Math.floor(100000 + Math.random() * 900000).toString()
        }));

        const orderData = {
            userId,
            items: itemsWithPins,
            address,
            amount,
            paymentMethod: "COD",
            payment: false,
            date: Date.now()
        }

        const newOrder = new orderModel(orderData)
        await newOrder.save()

        await userModel.findByIdAndUpdate(userId, { cartData: {} })

        res.json({ success: true, message: "Order Placed" })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Placing orders using Stripe Method
const placeOrderStripe = async (req, res) => {
    try {
        const { userId, items, amount, address } = req.body;
        const { origin } = req.headers;

        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

        const itemsWithPins = items.map(item => ({
            ...item,
            pin: Math.floor(100000 + Math.random() * 900000).toString()
        }));

        const orderData = {
            userId,
            items: itemsWithPins,
            address,
            amount,
            paymentMethod: "Stripe",
            payment: false,
            date: Date.now()
        }

        const newOrder = new orderModel(orderData)
        await newOrder.save()

        const line_items = items.map((item) => ({
            price_data: {
                currency: currency,
                product_data: {
                    name: item.name
                },
                unit_amount: item.price * 100
            },
            quantity: item.quantity
        }))

        line_items.push({
            price_data: {
                currency: currency,
                product_data: {
                    name: 'Delivery Charges'
                },
                unit_amount: deliveryCharge * 100
            },
            quantity: 1
        })

        const session = await stripe.checkout.sessions.create({
            success_url: `${origin}/verify?success=true&orderId=${newOrder._id}`,
            cancel_url: `${origin}/verify?success=false&orderId=${newOrder._id}`,
            line_items,
            mode: 'payment',
        })

        res.json({ success: true, session_url: session.url });

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Verify Stripe
const verifyStripe = async (req, res) => {
    const { orderId, success, userId } = req.body;
    try {
        if (success === 'true') {
            await orderModel.findByIdAndUpdate(orderId, { payment: true });
            await userModel.findByIdAndUpdate(userId, { cartData: {} });
            res.json({ success: true });
        } else {
            await orderModel.findByIdAndDelete(orderId);
            res.json({ success: false });
        }
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Placing orders using Razorpay Method
const placeOrderRazorpay = async (req, res) => {
   // Placeholder for Razorpay implementation
   res.json({ success: false, message: "Razorpay integration coming soon" })
}

// All Orders data for Admin Panel
const allOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({})
        res.json({ success: true, orders })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// User Order Data For Frontend
const userOrders = async (req, res) => {
    try {
        const { userId } = req.body
        const orders = await orderModel.find({ userId })
        res.json({ success: true, orders })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// update order status from Admin Panel
const updateStatus = async (req, res) => {
    try {
        const { orderId, status } = req.body
        const order = await orderModel.findById(orderId);
        
        if (!order) {
            return res.json({ success: false, message: 'Order not found' });
        }

        if (order.status === 'Cancelled') {
            return res.json({ success: false, message: 'Cannot update status of a cancelled order' });
        }

        const updateData = { status };
        if (status === 'Packing') updateData.packedAt = Date.now();
        if (status === 'Shipped') {
            updateData.shippedAt = Date.now();
            // Auto-assign delivery partner if not already assigned
            if (!order.deliveryPartner || !order.deliveryPartner.name) {
                updateData.deliveryPartner = pickDeliveryPartner(orderId);
            }
        }
        if (status === 'Out for delivery') {
            updateData.outForDeliveryAt = Date.now();
            // Auto-assign delivery partner if not already assigned
            if (!order.deliveryPartner || !order.deliveryPartner.name) {
                updateData.deliveryPartner = pickDeliveryPartner(orderId);
            }
        }
        if (status === 'Delivered') updateData.deliveredAt = Date.now();
        if (status === 'Cancelled') updateData.cancelledAt = Date.now();

        await orderModel.findByIdAndUpdate(orderId, updateData)
        res.json({ success: true, message: 'Status Updated' })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Update delivery partner details from Admin Panel
const updateDeliveryPartner = async (req, res) => {
    try {
        const { orderId, deliveryPartner } = req.body;
        const order = await orderModel.findById(orderId);
        if (!order) {
            return res.json({ success: false, message: 'Order not found' });
        }
        await orderModel.findByIdAndUpdate(orderId, { deliveryPartner });
        res.json({ success: true, message: 'Delivery partner updated' });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// Cancel Order from User
const cancelOrder = async (req, res) => {
    try {
        const { userId, orderId, cancelReason } = req.body;
        const order = await orderModel.findById(orderId);
        
        if (!order) {
            return res.json({ success: false, message: "Order not found" });
        }

        if (order.userId !== userId) {
            return res.json({ success: false, message: "Unauthorized action" });
        }

        // Check if order is in a cancellable state
        // user cannot cancel if it is Delivered, Cancelled, or Out for delivery
        const nonCancellableStates = ['Delivered', 'Cancelled', 'Out for delivery'];
        if (nonCancellableStates.includes(order.status)) {
            return res.json({ success: false, message: `Cannot cancel order after it is ${order.status.toLowerCase()}` });
        }

        await orderModel.findByIdAndUpdate(orderId, { status: "Cancelled", cancelReason: cancelReason || "", cancelledAt: Date.now() });
        res.json({ success: true, message: "Order Cancelled" });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

export { verifyStripe, placeOrder, placeOrderStripe, placeOrderRazorpay, allOrders, userOrders, updateStatus, cancelOrder, updateDeliveryPartner }
