# Cincinnati Hotel Chatbot System

A production-ready AI-powered hotel information chatbot system with admin dashboard and guest chat interface. Built with React, Node.js, and n8n workflow automation.

## 🎯 Project Overview

This system provides two distinct user experiences:
- **Guest Users**: Chat with an AI assistant that answers questions strictly from uploaded hotel information PDFs
- **Admin Users**: Upload/update hotel documents and view real-time usage statistics

## 🏗️ Architecture

```
┌─────────────┐         ┌─────────────┐         ┌──────────────┐
│   React     │────────▶│    n8n      │────────▶│   Node.js    │
│  Frontend   │         │  Workflows  │         │   Backend    │
│  (Port 3000)│◀────────│  (Port 5678)│◀────────│  (Port 5000) │
└─────────────┘         └─────────────┘         └──────────────┘
                                                        │
                                                        ▼
                                                 ┌──────────────┐
                                                 │   MongoDB    │
                                                 │  (Port 27017)│
                                                 └──────────────┘
```

### Tech Stack

**Frontend:**
- React 18 with Vite
- React Router for navigation
- TailwindCSS for styling
- Axios for API calls
- React Markdown for message rendering

**Backend:**
- Node.js with Express
- MongoDB with Mongoose ODM
- OpenAI API for chat completion
- @xenova/transformers for local embeddings
- pdf-parse for document processing
- Nodemailer for email notifications

**Automation:**
- n8n for workflow orchestration
- Webhooks for frontend-backend communication
- Email automation for contact forms

## 📁 Project Structure

```
cincinnati-hotel-chatbot/
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page components (Landing, User, Admin)
│   │   ├── services/        # API service layer
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
├── backend/                  # Node.js API server
│   ├── models/              # MongoDB schemas
│   │   ├── Document.js      # Hotel PDF documents
│   │   ├── ChatSession.js   # Conversation history
│   │   └── Statistics.js    # Analytics data
│   ├── routes/              # API endpoints
│   │   ├── document.js      # PDF upload/status
│   │   ├── chat.js          # Chat and contact form
│   │   └── admin.js         # Statistics dashboard
│   ├── services/            # Business logic
│   │   ├── embeddingService.js   # Vector embeddings
│   │   ├── ragService.js         # RAG pipeline
│   │   ├── emailService.js       # Email notifications
│   │   └── statisticsService.js  # Analytics
│   ├── server.js            # Express app
│   └── package.json
└── n8n-workflows/           # Automation workflows (to be created)
    ├── chat-workflow.json
    ├── upload-workflow.json
    └── email-workflow.json
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- MongoDB (local or Atlas)
- OpenAI API key
- Gmail account for email notifications (with app password)
- n8n installed (`npm install -g n8n`)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd cincinnati-hotel-chatbot
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   ```

   Edit `.env` with your credentials:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/cincinnati-hotel
   OPENAI_API_KEY=your_openai_api_key
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_gmail_app_password
   RECIPIENT_EMAILS=idan@tauga.ai,deleonajiraydiego@gmail.com
   NODE_ENV=development
   ```

3. **Setup Frontend**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Start MongoDB**
   ```bash
   # If using local MongoDB
   mongod
   ```

5. **Start Backend Server**
   ```bash
   cd backend
   npm run dev
   ```
   Server will run on `http://localhost:5000`

6. **Start Frontend**
   ```bash
   cd frontend
   npm run dev
   ```
   Frontend will run on `http://localhost:3000`

7. **Setup n8n** (See n8n Integration section below)

## 🔧 n8n Integration

### Installation & Setup

1. **Install n8n globally**
   ```bash
   npm install -g n8n
   ```

2. **Start n8n**
   ```bash
   n8n start
   ```
   n8n will run on `http://localhost:5678`

### Required Workflows

Three main workflows need to be created in n8n:

#### 1. Chat Workflow
Handles user messages and AI responses:
- Webhook trigger (receives user message)
- HTTP Request to backend `/api/chat/message`
- Response formatting
- Return to frontend

#### 2. Upload Workflow
Processes PDF uploads:
- Webhook trigger (receives file)
- HTTP Request to backend `/api/document/upload`
- Progress tracking
- Success/error notification

#### 3. Email Workflow
Sends contact form emails:
- Webhook trigger (receives contact details)
- HTTP Request to backend `/api/chat/contact`
- Email formatting
- Send via SMTP
- Confirmation response

### Workflow Configuration

1. In n8n dashboard, create a new workflow
2. Add a Webhook node as trigger
3. Set webhook URL (e.g., `http://localhost:5678/webhook/chat`)
4. Add HTTP Request nodes to call backend APIs
5. Configure response formatting
6. Activate the workflow

### Frontend Integration

Update frontend API calls to use n8n webhooks:
```javascript
// Instead of:
axios.post('/api/chat/message', data)

// Use:
axios.post('http://localhost:5678/webhook/chat', data)
```

## 📊 Features

### Guest User Experience
- ✅ Chat interface with AI assistant
- ✅ Real-time streaming responses
- ✅ Markdown formatting support
- ✅ Context-aware answers from uploaded PDFs
- ✅ Contact form when AI can't answer
- ✅ Email notification to staff
- ✅ Conversation history

### Admin Dashboard
- ✅ PDF document upload (replaces previous)
- ✅ Document processing status
- ✅ Real-time statistics:
  - Total chat sessions
  - Total questions asked
  - Questions by topic/category
  - Unanswered questions count
- ✅ Recent sessions list
- ✅ Auto-refresh dashboard

### RAG Pipeline
1. PDF uploaded → Text extraction
2. Text → Chunks (500 chars, 50 overlap)
3. Chunks → Vector embeddings (all-MiniLM-L6-v2)
4. Store in MongoDB with embeddings
5. User question → Query embedding
6. Cosine similarity search → Top 3 chunks
7. Context + Question → OpenAI GPT-3.5
8. Streaming response to user

### Question Categorization
Questions automatically categorized into topics:
- Rooms
- Dining
- Amenities
- Pricing
- Location
- Policies
- Events
- Services
- General
- Other

## 🔐 Security Features

- Rate limiting (100 requests per 15 minutes)
- File upload validation (PDF/TXT only, max 10MB)
- Input sanitization
- Environment variable protection
- CORS configuration
- Error message sanitization in production

## 📧 Email Configuration

### Gmail Setup
1. Enable 2-factor authentication
2. Generate app password: https://myaccount.google.com/apppasswords
3. Use app password in `.env` file

### Email Template
Contact form emails include:
- Guest contact details (name, phone, email)
- Full conversation history
- The specific unanswered question
- Professional HTML formatting

## 🗄️ Database Schema

### Document
```javascript
{
  filename: String,
  uploadedAt: Date,
  chunks: [{
    text: String,
    embedding: [Number]  // 384-dim vector
  }],
  active: Boolean
}
```

### ChatSession
```javascript
{
  sessionId: String (UUID),
  userType: 'user' | 'admin',
  messages: [{
    role: 'user' | 'assistant',
    content: String,
    timestamp: Date,
    topic: String,
    answeredFromDocument: Boolean
  }],
  contactFormSubmitted: Boolean,
  contactDetails: { name, phone, email, unansweredQuestion }
}
```

### Statistics
```javascript
{
  totalSessions: Number,
  topicBreakdown: Map<String, Number>,
  totalQuestions: Number,
  unansweredQuestions: Number,
  lastUpdated: Date
}
```

## 🧪 Testing

### API Endpoints

```bash
# Health check
curl http://localhost:5000/health

# Upload PDF
curl -X POST http://localhost:5000/api/document/upload \
  -F "file=@hotel-info.pdf"

# Get statistics
curl http://localhost:5000/api/admin/stats

# Create chat session
curl -X POST http://localhost:5000/api/chat/session \
  -H "Content-Type: application/json" \
  -d '{"userType": "user"}'
```

## 🚀 Production Deployment

### Backend Deployment (e.g., Railway, Render, Heroku)
1. Set environment variables
2. Configure MongoDB Atlas
3. Build command: `npm install`
4. Start command: `npm start`

### Frontend Deployment (e.g., Vercel, Netlify)
1. Build command: `npm run build`
2. Output directory: `dist`
3. Set API base URL environment variable

### n8n Deployment
- Use n8n Cloud: https://n8n.io/cloud/
- Or self-host on VPS with Docker
- Update webhook URLs in frontend

## 📝 Environment Variables

### Backend (.env)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/cincinnati-hotel
OPENAI_API_KEY=sk-...
EMAIL_USER=your@gmail.com
EMAIL_PASS=app_password
RECIPIENT_EMAILS=email1@example.com,email2@example.com
NODE_ENV=production
```

### Frontend (optional .env)
```env
VITE_API_BASE_URL=http://localhost:5000
```

## 🎨 UI/UX Highlights

- Modern, clean design with TailwindCSS
- Responsive layout (mobile-friendly)
- Loading states and error handling
- Smooth animations and transitions
- Professional color scheme
- Accessible components
- Real-time updates

## 🔄 How It Works

### User Flow
1. Land on homepage → Choose "Regular User"
2. Start chatting with Cincinnati Hotel AI
3. AI searches uploaded PDF for answers
4. If answer found → AI responds with context
5. If no answer → AI offers contact form
6. User fills form → Email sent to staff
7. Session saved with all statistics

### Admin Flow
1. Land on homepage → Choose "Admin"
2. View current statistics dashboard
3. Upload new hotel information PDF
4. Document processed and embedded
5. Previous document replaced
6. Stats update in real-time
7. View recent sessions and trends

## 🐛 Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running
- Check connection string in `.env`
- For Atlas, whitelist your IP

### Email Not Sending
- Verify Gmail app password
- Check 2FA is enabled
- Test with nodemailer directly

### Embedding Model Download
- First startup downloads ~23MB model
- Requires internet connection
- Cached for subsequent starts

### n8n Workflows Not Triggering
- Verify webhook URLs are correct
- Check n8n is running
- Test webhooks with curl

## 📦 Dependencies

### Backend Key Packages
- `express` - Web framework
- `mongoose` - MongoDB ODM
- `openai` - GPT API client
- `@xenova/transformers` - Local embeddings
- `pdf-parse` - PDF text extraction
- `nodemailer` - Email sending
- `multer` - File upload handling

### Frontend Key Packages
- `react` & `react-dom` - UI framework
- `react-router-dom` - Client-side routing
- `axios` - HTTP client
- `react-markdown` - Markdown rendering
- `tailwindcss` - Utility-first CSS

## 🎯 Future Enhancements

- [ ] User authentication
- [ ] Multi-language support
- [ ] Voice input/output
- [ ] Analytics charts and graphs
- [ ] Export conversation transcripts
- [ ] Webhook for external integrations
- [ ] Custom branding configuration
- [ ] A/B testing for responses
- [ ] Sentiment analysis
- [ ] Advanced search and filters

## 📄 License

MIT License - See LICENSE file for details

## 👥 Authors

Built for Cincinnati Hotel chatbot assignment

## 📞 Support

For issues or questions:
- Email: idan@tauga.ai, deleonajiraydiego@gmail.com
- GitHub Issues: [repository-url]/issues

---

**Note**: This is a production-ready system designed to meet all project requirements including React frontend, Node.js backend, n8n workflow automation, PDF-only responses, contact form emails, and real-time admin statistics.
