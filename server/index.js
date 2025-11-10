import express from 'express'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import cors from 'cors'
import http from 'http'
import authRoutes from './routes/auth.js'
import usersRoutes from './routes/users.js'
import convRoutes from './routes/conversation.js'
import attachSocket from './socket.js'
dotenv.config()
const app = express()
app.use(cors())
app.use(express.json())
app.use('/auth', authRoutes)
app.use('/users', usersRoutes)
app.use('/conversations', convRoutes)
const server = http.createServer(app)
attachSocket(server)
const PORT = process.env.PORT || 5000
mongoose.connect(process.env.MONGO_URI).then(() => {
    server.listen(PORT)
    console.log(`Server running on port ${PORT}`)})