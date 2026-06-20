import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    items: { type: Array, required: true },
    amount: { type: Number, required: true },
    address: { type: Object, required: true },
    status: { type: String, required: true, default: 'Order Placed' },
    paymentMethod: { type: String, required: true },
    payment: { type: Boolean, required: true, default: false },
    cancelReason: { type: String, default: "" },
    date: { type: Number, required: true },
    packedAt: { type: Number },
    shippedAt: { type: Number },
    outForDeliveryAt: { type: Number },
    deliveredAt: { type: Number },
    cancelledAt: { type: Number },
    deliveryPartner: {
        name: { type: String, default: "" },
        phone: { type: String, default: "" },
        vehicle: { type: String, default: "" },
        company: { type: String, default: "" },
        rating: { type: String, default: "" },
        avatarSeed: { type: String, default: "" }
    }
})

const orderModel = mongoose.models.order || mongoose.model('order', orderSchema);

export default orderModel;
