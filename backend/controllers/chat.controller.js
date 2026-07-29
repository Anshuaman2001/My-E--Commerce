import { GoogleGenerativeAI } from "@google/generative-ai";
import { v2 as cloudinary } from "cloudinary"
import orderModel from "../models/order.model.js";
import ticketModel from "../models/ticket.model.js";
import userModel from "../models/user.model.js";

const chatMessage = async (req, res) => {
    try {
        const { userId, message, history } = req.body;
        const lowerMsg = message.toLowerCase();

        // ── 1. Context Gathering ──────────────────────────────────────────────
        const user = await userModel.findById(userId);
        const orders = await orderModel.find({ userId }).sort({ date: -1 }).limit(10);

        // Build compact orders summary for AI
        let contextInfo = `User Name: ${user?.name || 'Valued Customer'}.\n`;

        if (orders.length > 0) {
            contextInfo += `User's recent orders (newest first):\n`;
            orders.forEach((order, i) => {
                const items = order.items.map(it => `${it.name} (x${it.quantity}, size ${it.size})`).join(', ');
                contextInfo += `  ${i + 1}. Order #${String(order._id).slice(-6).toUpperCase()} — ${items} — ₹${order.amount} — Status: ${order.status} — Date: ${new Date(order.date).toLocaleDateString('en-IN')}.\n`;
            });
        } else {
            contextInfo += `User has no orders yet.\n`;
        }

        if (user?.addressData?.length > 0) {
            const addr = user.addressData[0];
            contextInfo += `Default shipping address: ${addr.street}, ${addr.city}, ${addr.state}.\n`;
        }

        // ── 2. Detect complaint / issue intent (rule-based pre-check) ────────
        const complaintKeywords = ['complaint', 'complain', 'issue', 'problem', 'wrong', 'damaged',
            'broken', 'defective', 'missing', 'lost', 'not received', 'bad quality',
            'size issue', 'wrong item', 'raise ticket', 'file complaint', 'report'];
        const isComplaintIntent = complaintKeywords.some(kw => lowerMsg.includes(kw));

        // ── 3. Build system prompt ────────────────────────────────────────────
        const systemPrompt = `You are "Forever AI", the premium personal shopping assistant for Forever, a high-end fashion e-commerce store.

Your personality: Elegant, warm, professional, helpful. Use the customer's name naturally.

Store Information:
- Specializes in high-quality, timeless fashion for men and women.
- Return Policy: 7-day hassle-free returns in original condition with tags.
- Shipping: Fast delivery (3-7 business days). Free shipping above ₹500.
- Products: 100% authentic and premium quality.
- Support: Customers can file product-specific complaints via the chat complaint wizard.

Customer Context:
${contextInfo}

Response Rules:
1. Keep responses concise and warm (2-3 sentences max unless explaining something complex).
2. When the user asks about an order, refer to their specific order details from the context above.
3. If they mention a complaint, issue, problem, damaged item, wrong item, or seem unhappy — acknowledge their issue empathetically and tell them you are opening the complaint wizard for them to select the specific product.
4. Never say "I cannot help" — always offer an alternative.
5. Format responses in plain text (no markdown symbols like # or *).
6. If asked about tracking, give the current status from the context.`;

        // ── 4. AI Response Generation ─────────────────────────────────────────
        if (process.env.GEMINI_API_KEY) {
            try {
                const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
                const model = genAI.getGenerativeModel({
                    model: "gemini-1.5-flash",
                    systemInstruction: systemPrompt
                });

                // Build proper history (skip the initial welcome message)
                const chatHistory = (history || [])
                    .filter(h => h.text && h.text.trim())
                    .map(h => ({
                        role: h.isBot ? "model" : "user",
                        parts: [{ text: h.text }]
                    }));

                const chat = model.startChat({
                    history: chatHistory,
                    generationConfig: {
                        maxOutputTokens: 350,
                        temperature: 0.75
                    }
                });

                const result = await chat.sendMessage(message);
                const responseText = result.response.text();

                return res.json({
                    success: true,
                    reply: responseText,
                    suggestComplaint: isComplaintIntent
                });
            } catch (aiError) {
                console.error("AI Error:", aiError.message);
                // Fall through to rule-based fallback
            }
        }

        // ── 5. Rule-based Fallback ────────────────────────────────────────────
        let reply = "I'm here to help! Could you please tell me more about what you need?";

        if (isComplaintIntent) {
            reply = `I'm sorry to hear you're having an issue, ${user?.name || 'there'}. I'm opening the complaint wizard so you can select the specific product and describe the problem. Our team will review it promptly.`;
        } else if (lowerMsg.includes('track') || lowerMsg.includes('where') || lowerMsg.includes('order status')) {
            if (orders.length > 0) {
                const last = orders[0];
                const items = last.items.map(i => i.name).join(', ');
                reply = `Your most recent order (${items}) is currently: ${last.status}. It was placed on ${new Date(last.date).toLocaleDateString('en-IN')}.`;
            } else {
                reply = "I couldn't find any orders on your account. You can browse your order history on the Orders page.";
            }
        } else if (lowerMsg.includes('return') || lowerMsg.includes('refund')) {
            reply = "We offer a 7-day hassle-free return policy. Items must be in original condition with tags intact. Please initiate a return from your Orders page.";
        } else if (lowerMsg.includes('delivery') || lowerMsg.includes('shipping') || lowerMsg.includes('ship')) {
            reply = "We deliver in 3-7 business days. You'll receive a confirmation email once your order is dispatched. Free shipping on orders above ₹500!";
        } else if (lowerMsg.includes('hi') || lowerMsg.includes('hello') || lowerMsg.includes('hey')) {
            reply = `Hello ${user?.name || 'there'}! Welcome to Forever AI Support. How can I assist you today?`;
        } else if (lowerMsg.includes('cancel')) {
            if (orders.length > 0) {
                reply = `To cancel your order, please go to the Orders page, find the order, and tap "Cancel Order". If you face any issues, let me know and I'll help.`;
            } else {
                reply = "To cancel an order, please visit the Orders page. If you need help, I'm here!";
            }
        } else if (lowerMsg.includes('payment') || lowerMsg.includes('pay')) {
            reply = "We accept UPI, Net Banking, Credit/Debit cards, and Cash on Delivery. All payments are secured with 256-bit encryption.";
        }

        res.json({ success: true, reply, suggestComplaint: isComplaintIntent });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// ── Create Ticket (supports multiple images) ──────────────────────────────────
const createTicket = async (req, res) => {
    try {
        const { subject, message, orderId, productName } = req.body;
        const userId = req.userId;
        const imageFiles = req.files; // array from upload.array('images', 3)

        // Upload all images to Cloudinary
        const imageUrls = [];
        if (imageFiles && imageFiles.length > 0) {
            for (const file of imageFiles) {
                const uploadResponse = await cloudinary.uploader.upload(file.path, {
                    resource_type: 'image',
                    folder: 'tickets'
                });
                imageUrls.push(uploadResponse.secure_url);
            }
        }

        const newTicket = new ticketModel({
            userId,
            subject: subject || 'Customer Complaint',
            message,
            orderId: orderId || 'General',
            productName: productName || '',
            images: imageUrls,
            // Keep legacy single image field for backward compat
            image: imageUrls[0] || '',
            date: Date.now()
        });

        await newTicket.save();

        res.json({
            success: true,
            message: "Ticket created successfully. Our team will review it shortly.",
            ticketId: newTicket._id
        });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

const getUserTickets = async (req, res) => {
    try {
        const userId = req.userId;
        const tickets = await ticketModel.find({ userId }).sort({ date: -1 });
        res.json({ success: true, tickets });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

const listTickets = async (req, res) => {
    try {
        const tickets = await ticketModel.find({}).sort({ date: -1 });
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
