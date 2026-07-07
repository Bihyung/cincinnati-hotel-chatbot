# Deployment Guide - Cincinnati Hotel Chatbot

This guide covers deploying the Cincinnati Hotel Chatbot system to production.

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [MongoDB Setup](#mongodb-setup)
3. [Backend Deployment](#backend-deployment)
4. [Frontend Deployment](#frontend-deployment)
5. [n8n Setup](#n8n-setup)
6. [Environment Configuration](#environment-configuration)
7. [Post-Deployment](#post-deployment)

---

## Architecture Overview

```
┌─────────────────┐
│   Vercel/Netlify│  Frontend (React)
│   Port: 443     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Railway/Render│  Backend (Node.js)
│   Port: 5000    │
└────────┬────────┘
         │
         ├──────▶ MongoDB Atlas (Database)
         ├──────▶ OpenAI API (GPT-3.5)
         └──────▶ Gmail SMTP (Emails)

┌─────────────────┐
│   n8n Cloud     │  Workflow Orchestration
│   Port: 443     │
└─────────────────┘
```

---

## MongoDB Setup

### Using MongoDB Atlas (Recommended)

1. **Create Account**
   - Go to https://www.mongodb.com/cloud/atlas
   - Sign up for free tier

2. **Create Cluster**
   - Choose cloud provider (AWS/GCP/Azure)
   - Select region closest to your backend server
   - Choose M0 (Free tier)
   - Cluster name: `cincinnati-hotel`

3. **Configure Access**
   - Database Access → Add New User
   - Username: `hotel-admin`
   - Password: Generate secure password
   - Role: `Read and write to any database`

4. **Network Access**
   - IP Whitelist → Add IP Address
   - Option 1: Add your IP
   - Option 2: Allow access from anywhere (0.0.0.0/0) - **Use carefully**

5. **Get Connection String**
   - Clusters → Connect → Connect your application
   - Copy connection string:
   ```
   mongodb+srv://hotel-admin:<password>@cluster0.xxxxx.mongodb.net/cincinnati-hotel?retryWrites=true&w=majority
   ```

6. **Test Connection**
   ```bash
   mongosh "mongodb+srv://hotel-admin:<password>@cluster0.xxxxx.mongodb.net/cincinnati-hotel"
   ```

---

## Backend Deployment

### Option 1: Railway (Recommended)

1. **Setup**
   - Go to https://railway.app
   - Sign up with GitHub
   - Click "New Project" → "Deploy from GitHub repo"
   - Select `cincinnati-hotel-chatbot` repository

2. **Configure**
   - Root Directory: `/backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Port: Railway auto-assigns

3. **Environment Variables**
   Click "Variables" tab and add:
   ```env
   PORT=5000
   MONGODB_URI=mongodb+srv://hotel-admin:<password>@cluster0.xxxxx.mongodb.net/cincinnati-hotel
   OPENAI_API_KEY=sk-proj-...
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   RECIPIENT_EMAILS=idan@tauga.ai,deleonajiraydiego@gmail.com
   NODE_ENV=production
   ```

4. **Deploy**
   - Railway automatically deploys on push
   - Get public URL: `https://your-app.railway.app`

5. **Health Check**
   ```bash
   curl https://your-app.railway.app/health
   ```

### Option 2: Render

1. **Setup**
   - Go to https://render.com
   - Sign up with GitHub
   - New → Web Service
   - Connect repository

2. **Configure**
   - Name: `cincinnati-hotel-backend`
   - Environment: Node
   - Build Command: `cd backend && npm install`
   - Start Command: `cd backend && npm start`
   - Plan: Free

3. **Environment Variables**
   Same as Railway (see above)

4. **Deploy**
   - Click "Create Web Service"
   - Monitor logs for successful start

### Option 3: Heroku

1. **Setup**
   ```bash
   heroku login
   cd backend
   heroku create cincinnati-hotel-backend
   ```

2. **Configure**
   ```bash
   heroku config:set MONGODB_URI=mongodb+srv://...
   heroku config:set OPENAI_API_KEY=sk-proj-...
   heroku config:set EMAIL_USER=your@gmail.com
   heroku config:set EMAIL_PASS=your-app-password
   heroku config:set RECIPIENT_EMAILS=idan@tauga.ai,deleonajiraydiego@gmail.com
   heroku config:set NODE_ENV=production
   ```

3. **Deploy**
   ```bash
   git push heroku main
   heroku logs --tail
   ```

---

## Frontend Deployment

### Option 1: Vercel (Recommended)

1. **Setup**
   - Go to https://vercel.com
   - Sign up with GitHub
   - Import Project → Select repository

2. **Configure**
   - Framework Preset: Vite
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`

3. **Environment Variables**
   ```env
   VITE_API_URL=https://your-backend.railway.app
   ```

4. **Deploy**
   - Click "Deploy"
   - Get URL: `https://cincinnati-hotel.vercel.app`

5. **Custom Domain (Optional)**
   - Domains → Add Domain
   - Configure DNS records

### Option 2: Netlify

1. **Setup**
   - Go to https://netlify.com
   - Sign up with GitHub
   - Add new site → Import from Git

2. **Configure**
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `frontend/dist`

3. **Environment Variables**
   Site settings → Environment variables:
   ```env
   VITE_API_URL=https://your-backend.railway.app
   ```

4. **Deploy**
   - Netlify auto-deploys on push
   - Get URL: `https://cincinnati-hotel.netlify.app`

### Option 3: AWS S3 + CloudFront

1. **Build**
   ```bash
   cd frontend
   npm run build
   ```

2. **Upload to S3**
   ```bash
   aws s3 sync dist/ s3://cincinnati-hotel-frontend --delete
   ```

3. **Configure CloudFront**
   - Create distribution
   - Origin: S3 bucket
   - Default root object: `index.html`
   - Custom error response: 404 → /index.html (for SPA routing)

---

## n8n Setup

### Option 1: n8n Cloud (Recommended)

1. **Sign Up**
   - Go to https://n8n.io/cloud/
   - Create account (14-day free trial)
   - Choose plan: Starter ($20/month)

2. **Import Workflows**
   - Go to n8n dashboard
   - Import each workflow JSON file
   - Update HTTP Request node URLs to production backend

3. **Activate Workflows**
   - Enable each workflow (toggle in top-right)
   - Copy webhook URLs

4. **Update Frontend**
   If using n8n as proxy, update `frontend/src/services/api.js`:
   ```javascript
   const BASE_URL = 'https://your-n8n-instance.app.n8n.cloud/webhook';
   ```

### Option 2: Self-Hosted on DigitalOcean

1. **Create Droplet**
   - Go to https://digitalocean.com
   - Create Droplet → Docker on Ubuntu
   - Size: Basic ($6/month)

2. **Install n8n**
   ```bash
   ssh root@your-droplet-ip
   
   docker run -d \
     --name n8n \
     -p 5678:5678 \
     -e N8N_HOST=your-domain.com \
     -e N8N_PORT=5678 \
     -e N8N_PROTOCOL=https \
     -e N8N_BASIC_AUTH_ACTIVE=true \
     -e N8N_BASIC_AUTH_USER=admin \
     -e N8N_BASIC_AUTH_PASSWORD=secure_password \
     -e WEBHOOK_URL=https://your-domain.com \
     -v ~/.n8n:/home/node/.n8n \
     n8nio/n8n
   ```

3. **Setup SSL**
   ```bash
   # Install Certbot
   apt-get update
   apt-get install certbot nginx
   
   # Get certificate
   certbot --nginx -d your-domain.com
   ```

4. **Configure Nginx**
   ```nginx
   server {
     listen 443 ssl;
     server_name your-domain.com;
     
     location / {
       proxy_pass http://localhost:5678;
       proxy_set_header Host $host;
     }
   }
   ```

---

## Environment Configuration

### Backend .env (Production)
```env
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/cincinnati-hotel
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx
EMAIL_USER=notifications@yourhotel.com
EMAIL_PASS=app_specific_password
RECIPIENT_EMAILS=idan@tauga.ai,deleonajiraydiego@gmail.com
NODE_ENV=production
```

### Frontend .env (Production)
```env
VITE_API_URL=https://api.cincinnatihotel.com
```

### Gmail App Password Setup
1. Go to https://myaccount.google.com/security
2. Enable 2-Step Verification
3. Go to App passwords: https://myaccount.google.com/apppasswords
4. Create app password for "Mail"
5. Copy password (16 characters, no spaces)
6. Use in EMAIL_PASS variable

---

## Post-Deployment

### 1. Verify Services

**Backend Health Check**:
```bash
curl https://your-backend.railway.app/health
# Expected: {"status":"ok","embeddingReady":true,"timestamp":"..."}
```

**Frontend Load**:
```bash
curl https://cincinnati-hotel.vercel.app
# Expected: HTML content
```

**MongoDB Connection**:
```bash
mongosh "mongodb+srv://..." --eval "db.adminCommand('ping')"
# Expected: { ok: 1 }
```

### 2. Test Core Features

1. **Landing Page**: Visit frontend URL → See two buttons
2. **User Chat**: Click "Regular User" → Start chatting
3. **Admin Upload**: Click "Admin" → Upload sample PDF
4. **Statistics**: Check admin dashboard updates
5. **Contact Form**: Submit form → Check email received
6. **n8n Workflows**: Test each webhook manually

### 3. Initial Data Setup

**Upload Sample Hotel Document**:
```bash
curl -X POST https://your-backend.railway.app/api/document/upload \
  -F "file=@sample-hotel-info.pdf"
```

### 4. Monitoring Setup

**Backend Logs** (Railway):
- Dashboard → Service → Logs tab
- Enable log persistence

**Frontend Errors** (Vercel):
- Analytics → Errors
- Set up error notifications

**Database Monitoring** (MongoDB Atlas):
- Metrics → Charts
- Set up alerts for high CPU/memory

### 5. Performance Optimization

**Backend**:
- Enable gzip compression
- Add Redis for session caching (optional)
- Implement rate limiting per user

**Frontend**:
- Enable Vercel Analytics
- Optimize images and assets
- Enable CDN caching

**Database**:
- Create indexes:
  ```javascript
  db.chatsessions.createIndex({ sessionId: 1 })
  db.chatsessions.createIndex({ startedAt: -1 })
  db.documents.createIndex({ active: 1 })
  ```

### 6. Security Checklist

- [ ] All environment variables set securely
- [ ] MongoDB IP whitelist configured
- [ ] HTTPS enabled on all services
- [ ] CORS configured correctly
- [ ] Rate limiting enabled
- [ ] Input validation on all endpoints
- [ ] Error messages don't expose sensitive data
- [ ] API keys rotated if leaked
- [ ] n8n workflows require authentication

### 7. Backup Strategy

**MongoDB Atlas Auto-Backup**:
- Backups → Enable continuous backups
- Retention: 7 days minimum

**Manual Backup**:
```bash
mongodump --uri="mongodb+srv://..." --out=backup-$(date +%Y%m%d)
```

---

## Troubleshooting

### Backend Won't Start
- Check logs: `heroku logs --tail` or Railway logs
- Verify environment variables are set
- Check MongoDB connection string
- Ensure OpenAI API key is valid

### Frontend Can't Reach Backend
- Check CORS settings in backend
- Verify VITE_API_URL is correct
- Check browser console for errors
- Test backend health endpoint directly

### MongoDB Connection Issues
- Whitelist deployment server IP in Atlas
- Check connection string format
- Verify credentials are correct
- Test with mongosh CLI

### Emails Not Sending
- Verify Gmail app password is correct
- Check 2FA is enabled on Gmail
- Test with nodemailer directly
- Check spam folder

### n8n Webhooks Timing Out
- Increase backend timeout settings
- Check n8n execution logs
- Verify network connectivity
- Test webhooks with curl

---

## Submission Checklist

For project submission, ensure:

- [ ] Live frontend URL (Vercel/Netlify)
- [ ] Live backend URL (Railway/Render/Heroku)
- [ ] MongoDB Atlas connected
- [ ] Sample hotel PDF uploaded
- [ ] n8n workflows created and activated
- [ ] n8n workflow screenshots taken
- [ ] GitHub repository access granted
- [ ] README.md is complete
- [ ] Emails to idan@tauga.ai and deleonajiraydiego@gmail.com working

**Test Script**:
```bash
# 1. Test frontend loads
curl https://your-frontend.vercel.app

# 2. Test backend health
curl https://your-backend.railway.app/health

# 3. Test chat session creation
curl -X POST https://your-backend.railway.app/api/chat/session

# 4. Test document status
curl https://your-backend.railway.app/api/document/status

# 5. Test admin statistics
curl https://your-backend.railway.app/api/admin/stats
```

---

## Support & Maintenance

### Regular Tasks
- Monitor error logs weekly
- Check disk space and database size
- Review and rotate API keys monthly
- Update dependencies quarterly
- Backup database before major updates

### Scaling Considerations
- Add Redis for session management
- Implement WebSocket for real-time updates
- Use CDN for static assets
- Consider microservices architecture
- Add load balancer for high traffic

---

## Cost Estimation

### Free Tier (Development/Testing)
- MongoDB Atlas: Free (M0)
- Railway: $5/month credit
- Vercel: Free (hobby)
- n8n: 14-day trial
- **Total**: ~$0-5/month

### Production (Low Traffic)
- MongoDB Atlas: $9/month (M2)
- Railway/Render: $7/month
- Vercel: $20/month (Pro)
- n8n Cloud: $20/month
- **Total**: ~$56/month

### Production (Medium Traffic)
- MongoDB Atlas: $57/month (M10)
- Railway: $20/month
- Vercel: $20/month
- n8n Cloud: $50/month
- OpenAI: ~$30/month (varies)
- **Total**: ~$177/month

---

**Deployment Date**: ________  
**Deployed By**: ________  
**Frontend URL**: ________  
**Backend URL**: ________  
**n8n URL**: ________
