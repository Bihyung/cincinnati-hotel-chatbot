import mongoose from 'mongoose';

const statisticsSchema = new mongoose.Schema({
  totalSessions: {
    type: Number,
    default: 0
  },
  topicBreakdown: {
    type: Map,
    of: Number,
    default: new Map()
  },
  totalQuestions: {
    type: Number,
    default: 0
  },
  unansweredQuestions: {
    type: Number,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

// Singleton pattern - only one statistics document
statisticsSchema.statics.getStats = async function() {
  let stats = await this.findOne();
  if (!stats) {
    stats = await this.create({});
  }
  return stats;
};

export default mongoose.model('Statistics', statisticsSchema);
