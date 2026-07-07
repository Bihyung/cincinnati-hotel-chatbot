import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import ChatSession from '../models/ChatSession.js';
import ragService from '../services/ragService.js';
import statisticsService from '../services/statisticsService.js';
import emailService from '../services/emailService.js';

const router = express.Router();

// Create or get chat session
router.post('/session', async (req, res) => {
  try {
    const { sessionId, userType = 'user' } = req.body;
    
    let session;
    if (sessionId) {
      session = await ChatSession.findOne({ sessionId });
    }
    
    if (!session) {
      const newSessionId = sessionId || uuidv4();
      session = new ChatSession({
        sessionId: newSessionId,
        userType
      });
      await session.save();
      
      // Increment session count for statistics
      await statisticsService.incrementSessionCount();
    }
    
    res.json({
      sessionId: session.sessionId,
      messages: session.messages
    });
  } catch (error) {
    console.error('Session creation error:', error);
    res.status(500).json({ error: 'Failed to create session' });
  }
});

// Send message and get response
router.post('/message', async (req, res) => {
  try {
    const { sessionId, message } = req.body;
    
    if (!sessionId || !message) {
      return res.status(400).json({ error: 'Session ID and message are required' });
    }
    
    // Get session
    const session = await ChatSession.findOne({ sessionId });
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    // Add user message to session
    session.messages.push({
      role: 'user',
      content: message,
      timestamp: new Date()
    });
    session.lastActivity = new Date();
    
    // Categorize the question (with fallback)
    let topic = 'General';
    try {
      topic = await ragService.categorizeQuestion(message);
      console.log('[Chat] Question categorized as:', topic);
    } catch (error) {
      console.error('[Chat] Error categorizing question:', error);
      topic = 'General';
    }
    session.messages[session.messages.length - 1].topic = topic;
    
    // Search for relevant chunks
    const relevantChunks = await ragService.searchRelevantChunks(message);
    const context = relevantChunks 
      ? relevantChunks.map(chunk => chunk.text).join('\n\n')
      : null;
    
    // Get conversation history
    const conversationHistory = session.messages.slice(-10);
    
    // Generate streaming response
    const stream = await ragService.generateAnswer(message, context, conversationHistory);
    
    // Set up SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    
    let fullResponse = '';
    
    for await (const chunk of stream) {
      const token = chunk.choices[0]?.delta?.content;
      if (token) {
        fullResponse += token;
        res.write(`data: ${JSON.stringify({ type: 'token', content: token })}\n\n`);
      }
    }
    
    // Check if question was answered
    const answered = await ragService.checkIfAnswered(fullResponse);
    
    // Add assistant message to session
    session.messages.push({
      role: 'assistant',
      content: fullResponse,
      timestamp: new Date(),
      topic,
      answeredFromDocument: answered
    });
    
    await session.save();
    
    // Update statistics
    await statisticsService.updateStatistics(sessionId, message, topic, answered);
    
    // Send completion
    res.write(`data: ${JSON.stringify({ 
      type: 'done', 
      answered,
      showContactForm: !answered 
    })}\n\n`);
    res.end();
    
  } catch (error) {
    console.error('Message error:', error);
    res.write(`data: ${JSON.stringify({ 
      type: 'error', 
      message: 'Failed to generate response' 
    })}\n\n`);
    res.end();
  }
});

// Submit contact form
router.post('/contact', async (req, res) => {
  try {
    const { sessionId, name, phone, email, question } = req.body;
    
    if (!sessionId || !name || !email || !question) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    // Get session
    const session = await ChatSession.findOne({ sessionId });
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    // Update session with contact details
    session.contactFormSubmitted = true;
    session.contactDetails = {
      name,
      phone,
      email,
      unansweredQuestion: question
    };
    await session.save();
    
    // Format conversation summary
    const conversationSummary = session.messages
      .map(msg => `<p><strong>${msg.role === 'user' ? 'Guest' : 'AI'}:</strong> ${msg.content}</p>`)
      .join('');
    
    // Send email
    await emailService.sendContactFormEmail(
      { name, phone, email },
      conversationSummary,
      question
    );
    
    res.json({ success: true, message: 'Contact form submitted successfully' });
    
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({ error: 'Failed to submit contact form' });
  }
});

// Get session history
router.get('/session/:sessionId', async (req, res) => {
  try {
    const session = await ChatSession.findOne({ sessionId: req.params.sessionId });
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    res.json({
      sessionId: session.sessionId,
      messages: session.messages,
      startedAt: session.startedAt,
      lastActivity: session.lastActivity
    });
  } catch (error) {
    console.error('Get session error:', error);
    res.status(500).json({ error: 'Failed to get session' });
  }
});

export default router;
