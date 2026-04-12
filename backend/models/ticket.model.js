import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    orderId: { type: String },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    status: { type: String, default: "Pending" },
    image: { type: String, default: "" },
    date: { type: Number, required: true }
}, { minimize: false })

const ticketModel = mongoose.models.ticket || mongoose.model('ticket', ticketSchema);

export default ticketModel;
