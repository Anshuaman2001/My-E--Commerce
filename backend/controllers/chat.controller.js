import { GoogleGenerativeAI } from "@google/generative-ai";
import { v2 as cloudinary } from "cloudinary"
import orderModel from "../models/order.model.js";
import ticketModel from "../models/ticket.model.js";

const chatMessage = async (req, res) => {
    try {
        const { userId, message, history } = req.body;
        const lowerMsg = message.toLowerCase();

        // 1. Context Gathering (Fetch user orders)
        const orders = await orderModel.find({ userId });
        const lastOrder = orders.length > 0 ? orders[orders.length - 1] : null;

        // 2. Intent Detection (Simplified for baseline)
        let contextInfo = "";
        if (lastOrder) {
            contextInfo = `The user's last order ID is ${lastOrder._id}, items: ${lastOrder.items.map(i => i.name).join(", ")}, total: ${lastOrder.amount}, status: ${lastOrder.status}, date: ${new Date(lastOrder.date).toLocaleDateString()}.`;
        }

        const systemPrompt = `You are the AI Customer Support Assistant for "Forever", a premium e-commerce clothing store.
        Store Info: 7-day return policy, shipping takes 3-7 days, 100% original products.
        User Context: ${contextInfo}
        Be friendly, helpful, and concise. If the user wants to log a complaint, tell them to type "log complaint" followed by their message.`;

        // 3. AI Response Generation
        if (process.env.GEMINI_API_KEY) {
            try {
                const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
                const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

                const chat = model.startChat({
                    history: history ? history.map(h => ({
                        role: h.isBot ? "model" : "user",
                        parts: [{ text: h.text }]
                    })) : [],
                    generationConfig: { maxOutputTokens: 200 }
                });

                const result = await chat.sendMessage(`${systemPrompt}\n\nUser says: ${message}`);
                const responseText = result.response.text();
                
                return res.json({ success: true, reply: responseText });
            } catch (aiError) {
                console.error("AI Error:", aiError);
                // Fallback to smart logic if AI fails
            }
        }

        // 4. Smart Logic Fallback (Rule-based)
        let reply = "I'm here to help! Could you please specify your concern?";
        
        if (lowerMsg.includes('order') || lowerMsg.includes('track')) {
            if (lastOrder && lastOrder.items && lastOrder.items.length > 0) {
                reply = `Your last order (${lastOrder.items[0].name}...) is currently: ${lastOrder.status}. It was placed on ${new Date(lastOrder.date).toLocaleDateString()}.`;
            } else {
                reply = "I couldn't find any recent orders for your account. You can check your 'Orders' page for full history.";
            }
        } else if (lowerMsg.includes('delivery') || lowerMsg.includes('ship')) {
            reply = "Shipping usually takes 3 to 7 business days. You'll receive an email with tracking details once your order is dispatched.";
        } else if (lowerMsg.includes('return') || lowerMsg.includes('refund')) {
            reply = "We offer a 7-day easy return policy. Items must be in original condition with tags.";
        } else if (lowerMsg.includes('complaint') || lowerMsg.includes('log complaint')) {
            reply = "I've noted that you'd like to log a complaint. Please describe the issue in detail, and I will create a support ticket for our team to review.";
        } else if (lowerMsg.includes('hi') || lowerMsg.includes('hello')) {
            reply = "Hello! I'm your Forever AI Assistant. How can I help you with your shopping today?";
        }

        res.json({ success: true, reply });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

const createTicket = async (req, res) => {
    try {
        const { subject, message, orderId } = req.body;
        const userId = req.userId;
        const imageFile = req.file;
        
        let imageUrl = "";
        if (imageFile) {
            const uploadResponse = await cloudinary.uploader.upload(imageFile.path, { resource_type: 'image' });
            imageUrl = uploadResponse.secure_url;
        }

        const newTicket = new ticketModel({
            userId,
            subject,
            message,
            orderId: orderId || "General",
            image: imageUrl,
            date: Date.now()
        });
        await newTicket.save();
        res.json({ success: true, message: "Ticket created successfully. Our team will review it shortly.", ticketId: newTicket._id });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

const getUserTickets = async (req, res) => {
    try {
        const userId = req.userId;
        const tickets = await ticketModel.find({ userId });
        res.json({ success: true, tickets: tickets.reverse() });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

const listTickets = async (req, res) => {
    try {
        const tickets = await ticketModel.find({});
        res.json({ success: true, tickets });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

const updateTicketStatus = async (req, res) => {
    try {
        const { ticketId, status } = req.body;
        await ticketModel.findByIdAndUpdate(ticketId, { status });
        res.json({ success: true, message: "Ticket status updated" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

export { chatMessage, createTicket, listTickets, updateTicketStatus, getUserTickets };
