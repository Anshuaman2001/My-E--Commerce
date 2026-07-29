import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    orderId: { type: String, default: "General" },
    productName: { type: String, default: "" },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    status: { type: String, default: "Pending" },
    // Multiple images support
    images: { type: [String], default: [] },
    // Legacy single-image field (kept for backward compat)
    image: { type: String, default: "" },
    date: { type: Number, required: true }
}, { minimize: false })

const ticketModel = mongoose.models.ticket || mongoose.model('ticket', ticketSchema);

export default ticketModel;
