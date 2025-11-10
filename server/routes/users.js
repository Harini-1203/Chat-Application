import express from 'express'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import { onlineUsers } from '../socket.js'
const router = express.Router()
router.use((req, res, next) => {
const auth = req.headers.authorization
if (!auth) return res.status(401).end()
const token = auth.split(' ')[1]
try { req.user = jwt.verify(token, process.env.JWT_SECRET); next() } catch { return res.status(401).end() }
})
router.get('/', async (req, res) => {
const users = await User.find({ _id: { $ne: req.user.id } }).select('_id name email')
const list = users.map(u => ({ id: u._id, name: u.name, email: u.email, online: !!onlineUsers[u._id] }))
res.json(list)
})
export default router