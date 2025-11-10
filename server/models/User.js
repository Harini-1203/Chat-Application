import mongoose from 'mongoose'
const schema = new mongoose.Schema({
email: { type: String, required: true, unique: true },
password: { type: String, required: true },
name: { type: String, required: true }
}, { timestamps: true })

// Drop any existing indexes that we don't need
schema.pre('save', async function() {
  const Model = this.constructor;
  try {
    await Model.collection.dropIndex('username_1');
  } catch (e) {
    // Index might not exist, that's fine
  }
});
export default mongoose.model('User', schema)