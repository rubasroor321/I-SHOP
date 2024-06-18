// routes/messages.js

import express from 'express';
import Message from '../models/message.js';
import User from '../models/user.js';

const router = express.Router();

router.post('/send', async (req, res) => {
    try {
        const { sender, receiver, content } = req.body;

        const senderUser = await User.findById(sender);
        const receiverUser = await User.findById(receiver);
        if (!senderUser || !receiverUser) {
            return res.status(400).send('Sender or receiver not found');
        }

        const message = new Message({
            sender,
            receiver,
            content,
        });

        const savedMessage = await message.save();

        // Update sender's and receiver's messages arrays
        await User.findByIdAndUpdate(sender, { $push: { messages: savedMessage._id } });
        await User.findByIdAndUpdate(receiver, { $push: { messages: savedMessage._id } });

        res.status(201).send(savedMessage);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

router.get('/:senderId/:receiverId', async (req, res) => {
    try {
        const { senderId, receiverId } = req.params;

        const senderUser = await User.findById(senderId);
        const receiverUser = await User.findById(receiverId);
        if (!senderUser || !receiverUser) {
            return res.status(400).send('Sender or receiver not found');
        }

        const messages = await Message.find({
            $or: [
                { sender: senderId, receiver: receiverId },
                { sender: receiverId, receiver: senderId }
            ]
        }).sort({ createdAt: 1 });

        res.status(200).send(messages);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

export default router;
