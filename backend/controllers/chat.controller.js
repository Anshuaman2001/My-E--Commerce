import { GoogleGenerativeAI } from "@google/generative-ai";
import { v2 as cloudinary } from "cloudinary"
import orderModel from "../models/order.model.js";
import ticketModel from "../models/ticket.model.js";

import userModel from "../models/user.model.js";

const chatMessage = async (req, res) => {
    try {
        const { userId, message, history } = req.body;
        const lowerMsg = message.toLowerCase();

        // 1. Context Gathering (Fetch user profile and orders)
        const user = await userModel.findById(userId);
        const orders = await orderModel.find({ userId });
        const lastOrder = orders.length > 0 ? orders[orders.length - 1] : null;

        // 2. Build Rich User Context
        let contextInfo = `User Name: ${user ? user.name : 'Valued Customer'}. `;
        if (lastOrder) {
            contextInfo += `Last order ID: ${lastOrder._id}, items: ${lastOrder.items.map(i => i.name).join(", ")}, total: ${lastOrder.amount}, status: ${lastOrder.status}, date: ${new Date(lastOrder.date).toLocaleDateString()}. `;
        }
        if (user && user.addressData && user.addressData.length > 0) {
            const addr = user.addressData[0];
            contextInfo += `Default shipping address: ${addr.street}, ${addr.city}. `;
        }

        const systemPrompt = `You are "Forever AI", the premium personal shopping assistant for Forever, a high-end fashion e-commerce store.
        Your personality: Elegant, enthusiastic, professional, and deeply helpful.
        Your Goal: Provide a "white-glove" service experience. Use the user's name often and make them feel special.
        
        Store Information:
        - We specialize in high-quality, timeless fashion.
        - Return Policy: 7-day hassle-free returns in original condition.
        - Shipping: Fast delivery (3-7 business days).
        - Products: 100% authentic and premium.
        
        User Context: ${contextInfo}
        
        Current conversation rules:
        1. Keep responses concise but charming (max 2-3 sentences unless explaining something).
        2. If they ask about an order, refer to their specific last order if available.
        3. If they seem unhappy, be empathetic and offer to help them log a complaint by typing "log complaint".
        4. If they ask for style advice, be a fashion expert.`;

        // 3. AI Response Generation
        if (process.env.GEMINI_API_KEY) {
            try {
                const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
                const model = genAI.getGenerativeModel({ 
                    model: "gemini-1.5-flash",
                    systemInstruction: systemPrompt
                });

                const chat = model.startChat({
                    history: history ? history.map(h => ({
                        role: h.isBot ? "model" : "user",
                        parts: [{ text: h.text }]
                    })) : [],
                    generationConfig: { 
                        maxOutputTokens: 300,
                        temperature: 0.7
                    }
                });

                const result = await chat.sendMessage(message);
                const responseText = result.response.text();
                
                return res.json({ success: true, reply: responseText });
            } catch (aiError) {
                console.error("AI Error:", aiError);
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
        const ticket = await ticketModel.findById(ticketId);
        
        if (!ticket) {
            return res.json({ success: false, message: "Ticket not found" });
        }

        if (ticket.status === 'Resolved') {
            return res.json({ success: false, message: "Cannot update status of a resolved ticket" });
        }

        await ticketModel.findByIdAndUpdate(ticketId, { status });
        res.json({ success: true, message: "Ticket status updated" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

export { chatMessage, createTicket, listTickets, updateTicketStatus, getUserTickets };
