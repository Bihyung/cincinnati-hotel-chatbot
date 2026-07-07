import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  chunks: [{
    text: String,
    embedding: [Number]
  }],
  active: {
    type: Boolean,
    default: true
  }
});

export default mongoose.model('Document', documentSchema);
