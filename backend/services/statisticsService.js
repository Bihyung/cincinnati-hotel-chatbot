import Statistics from '../models/Statistics.js';
import ChatSession from '../models/ChatSession.js';

class StatisticsService {
  async updateStatistics(sessionId, message, topic, answered) {
    const stats = await Statistics.getStats();
    
    // Increment total questions
    stats.totalQuestions += 1;
    
    // Update topic breakdown
    if (topic) {
      const currentCount = stats.topicBreakdown.get(topic) || 0;
      stats.topicBreakdown.set(topic, currentCount + 1);
    }
    
    // Track unanswered questions
    if (!answered) {
      stats.unansweredQuestions += 1;
    }
    
    stats.lastUpdated = new Date();
    await stats.save();
  }

  async incrementSessionCount() {
    const stats = await Statistics.getStats();
    stats.totalSessions += 1;
    stats.lastUpdated = new Date();
    await stats.save();
  }

  async getStatistics() {
    const stats = await Statistics.getStats();
    
    // Convert Map to Object for JSON response
    const topicBreakdown = {};
    stats.topicBreakdown.forEach((value, key) => {
      topicBreakdown[key] = value;
    });
    
    return {
      totalSessions: stats.totalSessions,
      totalQuestions: stats.totalQuestions,
      topicBreakdown,
      unansweredQuestions: stats.unansweredQuestions,
      lastUpdated: stats.lastUpdated
    };
  }

  async getRecentSessions(limit = 10) {
    const sessions = await ChatSession.find()
      .sort({ lastActivity: -1 })
      .limit(limit)
      .select('sessionId startedAt lastActivity messages userType');
    
    // Format sessions with message count
    return sessions.map(session => ({
      sessionId: session.sessionId,
      startedAt: session.startedAt,
      lastActivity: session.lastActivity,
      messageCount: session.messages.length,
      userType: session.userType
    }));
  }
}

export default new StatisticsService();
