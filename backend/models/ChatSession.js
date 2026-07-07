import mongoose from 'mongoose';

const chatSessionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  userType: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  messages: [{
    role: {
      type: String,
      enum: ['user', 'assistant']
    },
    content: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    topic: String, // Categorized topic (e.g., "Rooms", "Restaurant", "Pricing")
    answeredFromDocument: {
      type: Boolean,
      default: true
    }
  }],
  startedAt: {
    type: Date,
    default: Date.now
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  contactFormSubmitted: {
    type: Boolean,
    default: false
  },
  contactDetails: {
    name: String,
    phone: String,
    email: String,
    unansweredQuestion: String
  }
});

chatSessionSchema.index({ sessionId: 1 });
chatSessionSchema.index({ startedAt: -1 });

export default mongoose.model('ChatSession', chatSessionSchema);
