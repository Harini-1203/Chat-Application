import mongoose from 'mongoose'

const schema = new mongoose.Schema({
  conversation: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, default: '' },
  // read/delivered information persisted
  delivered: { type: Boolean, default: true },
  deliveredAt: { type: Date, default: null },
  read: { type: Boolean, default: false },
  readAt: { type: Date, default: null }
}, { timestamps: true })

export default mongoose.model('Message', schema)
