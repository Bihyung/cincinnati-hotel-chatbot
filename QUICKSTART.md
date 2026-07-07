# Quick Start Guide - Cincinnati Hotel Chatbot

Get the system running in 10 minutes!

## Prerequisites Check

```bash
# Check Node.js version (need 18+)
node --version

# Check npm
npm --version

# Check MongoDB (if running locally)
mongod --version

# Check if ports are free
lsof -i :3000  # Frontend
lsof -i :5000  # Backend
lsof -i :5678  # n8n (optional)
```

## 5-Step Quick Start

### Step 1: Clone & Install (2 minutes)

```bash
# Navigate to project
cd cincinnati-hotel-chatbot

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Step 2: Configure Environment (2 minutes)

**Backend (.env)**:
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/cincinnati-hotel
OPENAI_API_KEY=sk-proj-your-key-here
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password
RECIPIENT_EMAILS=idan@tauga.ai,deleonajiraydiego@gmail.com
NODE_ENV=development
```

> 🔑 **Don't have OpenAI API key?** Get one at https://platform.openai.com/api-keys

### Step 3: Start MongoDB (1 minute)

**Option A: Local MongoDB**
```bash
# Start MongoDB service
mongod

# Or on macOS with Homebrew
brew services start mongodb-community
```

**Option B: MongoDB Atlas (Cloud)**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free cluster
3. Get connection string
4. Update `MONGODB_URI` in `.env`

### Step 4: Start Backend (2 minutes)

```bash
cd backend
npm run dev
```

**Expected output**:
```
[Server] Running on port 5000
[Server] Environment: development
[MongoDB] Connected successfully
[Embeddings] warming up model...
[Embeddings] model ready
[Email] Server is ready to send emails
[Server] All services initialized
```

**Test backend**:
```bash
curl http://localhost:5000/health
# Should return: {"status":"ok","embeddingReady":true,"timestamp":"..."}
```

### Step 5: Start Frontend (1 minute)

```bash
# In a new terminal
cd frontend
npm run dev
```

**Expected output**:
```
VITE v5.0.8  ready in 432 ms

➜  Local:   http://localhost:3000/
➜  Network: use --host to expose
```

## 🎉 You're Ready!

Open browser: **http://localhost:3000**

You should see the landing page with two buttons:
- **Regular User** - For guest chat
- **Admin** - For document upload and statistics

---

## First Time Usage

### 1. Upload Hotel Information

1. Click **"Admin"** button
2. Switch to **"Upload Document"** tab
3. Upload `sample-hotel-info.txt` (located in project root)
4. Wait for processing (~10-20 seconds)
5. Switch back to **"Overview"** tab

### 2. Test Chat

1. Go back to home: http://localhost:3000
2. Click **"Regular User"** button
3. Try these test questions:
   - "What are your room rates?"
   - "Do you have a restaurant?"
   - "What time is check-in?"
   - "Do you allow pets?"
   - "What's nearby the hotel?"

### 3. Test Contact Form

1. Ask a question not in the document:
   - "Do you have a helicopter pad?"
2. AI should say it doesn't know
3. Contact form should appear
4. Fill it out and submit
5. Check email at configured addresses

---

## Troubleshooting

### Backend won't start

**Problem**: MongoDB connection error
```
Solution:
1. Check MongoDB is running: mongod
2. Verify connection string in .env
3. Try default: mongodb://localhost:27017/cincinnati-hotel
```

**Problem**: OpenAI API error
```
Solution:
1. Check API key is valid
2. Check account has credits
3. Test at: https://platform.openai.com/playground
```

**Problem**: Embedding model download slow
```
Solution:
- First startup downloads ~23MB model
- Wait 30-60 seconds
- Model is cached for future starts
```

### Frontend won't connect to backend

**Problem**: CORS error in browser console
```
Solution:
1. Check backend is running on port 5000
2. Verify CORS is enabled in backend/server.js
3. Clear browser cache
```

**Problem**: 404 errors on API calls
```
Solution:
1. Check backend URL in frontend/src/services/api.js
2. Should be: http://localhost:5000
3. Restart both frontend and backend
```

### Email not sending

**Problem**: Authentication error
```
Solution:
1. Enable 2FA on Gmail account
2. Generate app password: https://myaccount.google.com/apppasswords
3. Use app password (16 chars) in EMAIL_PASS
4. Don't use regular Gmail password
```

---

## Development Workflow

### Making Changes

**Backend changes**:
```bash
cd backend
# Nodemon auto-restarts on file changes
npm run dev
```

**Frontend changes**:
```bash
cd frontend
# Vite hot-reloads automatically
npm run dev
```

**Database reset**:
```bash
mongosh cincinnati-hotel
db.dropDatabase()
exit
```

### Viewing Logs

**Backend logs**: Check terminal where backend is running

**Frontend logs**: Open browser DevTools → Console

**MongoDB logs**:
```bash
mongosh cincinnati-hotel
db.chatsessions.find().pretty()
db.documents.find().pretty()
db.statistics.find().pretty()
```

---

## Production Build

### Backend
```bash
cd backend
npm install --production
npm start
```

### Frontend
```bash
cd frontend
npm run build
npm run preview  # Test production build locally
```

---

## Optional: n8n Setup

If you want to use n8n workflow orchestration:

```bash
# Install n8n globally
npm install -g n8n

# Start n8n
n8n start

# Access at: http://localhost:5678
```

See `n8n-workflows/README.md` for complete setup instructions.

---

## Need Help?

### Check Documentation
- Main README: `README.md`
- Deployment Guide: `DEPLOYMENT.md`
- n8n Workflows: `n8n-workflows/README.md`

### Test API Endpoints
```bash
# Health check
curl http://localhost:5000/health

# Create session
curl -X POST http://localhost:5000/api/chat/session \
  -H "Content-Type: application/json"

# Upload document
curl -X POST http://localhost:5000/api/document/upload \
  -F "file=@sample-hotel-info.txt"

# Get statistics
curl http://localhost:5000/api/admin/stats
```

### Common Commands

```bash
# Stop all running processes
# Press Ctrl+C in each terminal

# Kill processes on ports if stuck
lsof -ti:3000 | xargs kill -9  # Frontend
lsof -ti:5000 | xargs kill -9  # Backend
lsof -ti:27017 | xargs kill -9  # MongoDB

# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## Next Steps

1. ✅ System is running locally
2. 📄 Upload your own hotel information PDF
3. 🎨 Customize branding and colors
4. 🚀 Deploy to production (see DEPLOYMENT.md)
5. 🔧 Set up n8n workflows
6. 📊 Monitor usage statistics
7. 📧 Configure email notifications

---

**Time to get started**: ~10 minutes  
**Ready for testing**: Immediately  
**Production ready**: After configuration

Enjoy building with Cincinnati Hotel Chatbot! 🏨✨
