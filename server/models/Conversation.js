import mongoose from 'mongoose'

const schema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  // store a reference to the Message document (so we can populate sender/text/time)
  lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'Message', default: null }
}, { timestamps: true })

export default mongoose.model('Conversation', schema)
