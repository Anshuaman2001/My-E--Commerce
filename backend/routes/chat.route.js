import express from 'express';
import { chatMessage, createTicket, listTickets, updateTicketStatus, getUserTickets } from '../controllers/chat.controller.js';
import upload from '../middleware/multer.js';
import authUser from '../middleware/auth.js';
import adminAuth from '../middleware/adminAuth.js';

const chatRouter = express.Router();

chatRouter.post('/message', authUser, chatMessage);
chatRouter.post('/ticket', authUser, upload.single('image'), createTicket);
chatRouter.post('/user-tickets', authUser, getUserTickets);
chatRouter.post('/tickets/list', adminAuth, listTickets);
chatRouter.post('/tickets/status', adminAuth, updateTicketStatus);

export default chatRouter;
