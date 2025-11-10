import express from 'express'
import jwt from 'jsonwebtoken'
import Conversation from '../models/Conversation.js'
import Message from '../models/Message.js'
import User from '../models/User.js'
import mongoose from 'mongoose'
const router = express.Router()

// auth middleware
router.use((req, res, next) => {
  const auth = req.headers.authorization
  if (!auth) return res.status(401).end()
  const token = auth.split(' ')[1]
  try { req.user = jwt.verify(token, process.env.JWT_SECRET); next() } catch { return res.status(401).end() }
})

// GET conversations for current user (returns withUser + lastMessage)
router.get('/', async (req, res) => {
  try {
    const convs = await Conversation.find({ participants: req.user.id })
      .populate('participants', 'name email')
      .populate({
        path: 'lastMessage',
        select: 'text createdAt sender delivered read deliveredAt readAt',
        populate: { path: 'sender', select: 'name email' },
      })
      .sort('-updatedAt')

    const formatted = convs.map(c => {
      const withUser = c.participants.find(p => p.id !== req.user.id);
      return {
        id: c._id,
        withUser,
        lastMessage: c.lastMessage
          ? { text: c.lastMessage.text, createdAt: c.lastMessage.createdAt, sender: c.lastMessage.sender }
          : null,
      };
    });

    res.json(formatted);
  } catch (err) {
    console.error('Error loading conversations:', err);
    res.status(500).json({ message: 'Failed to load conversations' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { withUserId } = req.body;
    if (!withUserId) {
      return res.status(400).json({ message: 'withUserId required' });
    }
    if (!req.user?.id) {
      return res.status(401).json({ message: 'Unauthorized (no user in token)' });
    }

    // ✅ Mongoose can handle string IDs; no need to cast manually
    let conversation = await Conversation.findOne({
      participants: { $all: [req.user.id, withUserId] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [req.user.id, withUserId],
      });
    }

    res.json(conversation);
  } catch (err) {
    console.error('Error creating conversation:', err);
    res.status(500).json({ message: 'Error creating conversation', error: err.message });
  }
});


router.post('/:id/messages', async (req, res) => {
  try {
    const conversationId = req.params.id;
    const { text } = req.body;

    if (!text) return res.status(400).json({ message: 'Text is required' });

    // 1️⃣ Create the message first
    const msg = await Message.create({
      conversation: conversationId,
      sender: req.user.id,
      text,
      delivered: true,
      deliveredAt: new Date(),
    });

    // 2️⃣ Update conversation.lastMessage with the message's ObjectId
    await Conversation.findByIdAndUpdate(conversationId, { lastMessage: msg._id, updatedAt: new Date() });

    // 3️⃣ Populate sender for client
    const populatedMsg = await msg.populate('sender', 'name email');

    res.status(201).json(populatedMsg);
  } catch (err) {
    console.error('Error saving message:', err);
    res.status(500).json({ message: 'Error saving message', error: err.message });
  }
});

router.get('/:id/messages', async (req, res) => {
  try {
    const msgs = await Message.find({ conversation: req.params.id })
      .sort('createdAt')
      .populate('sender', 'name email');
    res.json(msgs);
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ message: 'Error fetching messages' });
  }
});



export default router
