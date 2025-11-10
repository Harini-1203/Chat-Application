import express from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
const router = express.Router()
router.post('/register', async (req, res) => {
const { name, email, password } = req.body
if (!name || !email || !password) return res.status(400).json({ message: 'Please fill all fields' })
const exists = await User.findOne({ email })
if (exists) return res.status(400).json({ message: 'User already exists with this email' })
const hash = await bcrypt.hash(password, 10)
const user = await User.create({ name, email, password: hash })
const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)
res.json({ token, user: { id: user._id, email: user.email } })
})
router.post('/login', async (req, res) => {
const { email, password } = req.body
const user = await User.findOne({ email })
if (!user) return res.status(400).json({ message: 'invalid' })
const ok = await bcrypt.compare(password, user.password)
if (!ok) return res.status(400).json({ message: 'invalid' })
const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)
res.json({ token, user: { id: user._id, email: user.email } })
})
export default router