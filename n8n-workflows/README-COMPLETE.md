# n8n Workflow Documentation - Complete Package

## 📚 Documentation Files

This folder contains everything you need to create and submit n8n workflows:

### 1. **STEP-BY-STEP-GUIDE.md** (Main Guide)
   - **Use this for**: Detailed instructions on creating each workflow
   - **Covers**: Every single click, configuration, and setting
   - **Time needed**: Follow along for 30-45 minutes
   - **Best for**: First-time n8n users

### 2. **VISUAL-GUIDE.md** (Visual Reference)
   - **Use this for**: Understanding workflow structure
   - **Covers**: Diagrams, visual layouts, what workflows should look like
   - **Time needed**: Quick reference, 5 minutes to review
   - **Best for**: Visual learners, double-checking your work

### 3. **QUICK-REFERENCE.md** (Cheat Sheet)
   - **Use this for**: Quick lookup while building
   - **Covers**: Commands, expressions, common fixes
   - **Time needed**: Instant reference
   - **Best for**: When you're stuck or need a quick answer

---

## 🎯 Quick Start - Which Guide to Use?

### If you've NEVER used n8n before:
1. Read **STEP-BY-STEP-GUIDE.md** from start to finish
2. Follow each instruction exactly
3. Use **QUICK-REFERENCE.md** for commands
4. Check **VISUAL-GUIDE.md** to verify your workflows look correct

### If you've used n8n before:
1. Skim **VISUAL-GUIDE.md** to see what you need to build
2. Use **QUICK-REFERENCE.md** for specific settings
3. Reference **STEP-BY-STEP-GUIDE.md** if you get stuck

### If you're in a hurry:
1. Use **QUICK-REFERENCE.md** Speed Run Checklist
2. Reference **VISUAL-GUIDE.md** for node configurations
3. Should take ~30 minutes total

---

## 📋 Three Workflows You Need to Create

### Workflow 1: Chat Message Handler
- **Purpose**: Route chat messages from frontend to backend
- **Complexity**: ⭐ Easy (2 nodes)
- **Time**: 5 minutes
- **Nodes**: Webhook → HTTP Request

### Workflow 2: Document Upload Handler
- **Purpose**: Handle PDF file uploads
- **Complexity**: ⭐⭐ Medium (3 nodes)
- **Time**: 5 minutes
- **Nodes**: Webhook → HTTP Request → Set (optional)

### Workflow 3: Contact Form Handler
- **Purpose**: Send email notifications when AI can't answer
- **Complexity**: ⭐⭐⭐ Advanced (4 nodes, requires email setup)
- **Time**: 10-15 minutes
- **Nodes**: Webhook → HTTP Request → Gmail → Respond to Webhook

---

## 🚀 Installation & Setup

### Install n8n (One Time)
```bash
npm install -g n8n
```

### Start n8n (Every Time)
```bash
n8n start
```

### Access n8n
Open browser: **http://localhost:5678**

---

## ✅ What You'll Submit

For the assignment, you need to provide:

### 1. Screenshots (6-9 total)
- [ ] Chat Message Workflow (full view)
- [ ] Document Upload Workflow (full view)
- [ ] Contact Form Workflow (full view)
- [ ] Chat Message Execution (successful run)
- [ ] Document Upload Execution (successful run)
- [ ] Contact Form Execution (successful run)
- [ ] (Optional) Individual node configurations

### 2. JSON Exports (3 files)
- [ ] `chat-message-workflow.json`
- [ ] `document-upload-workflow.json`
- [ ] `contact-form-workflow.json`

### 3. Brief Documentation
- [ ] Webhook URLs for each workflow
- [ ] How to import the workflows
- [ ] How to test each workflow
- [ ] Any credentials needed (Gmail)

---

## 📧 Submission Format

**Email to:**
- idan@tauga.ai
- deleonajiraydiego@gmail.com

**Subject:**
"Cincinnati Hotel Chatbot - n8n Workflows"

**Include:**
1. Link to screenshots (Google Drive/Dropbox folder)
2. Attach or link to JSON files
3. Brief README explaining:
   - What each workflow does
   - Webhook URLs
   - How to import and test
4. (Optional) n8n Cloud URL if using cloud version

---

## 🎓 Learning Path

### Day 1: Setup & Basics (30 minutes)
1. Install n8n
2. Complete Workflow 1 (Chat Message)
3. Understand how webhooks work
4. Test with curl command

### Day 2: File Handling (20 minutes)
1. Create Workflow 2 (Document Upload)
2. Learn about binary data
3. Test with file upload
4. Verify backend receives file

### Day 3: Email Integration (30 minutes)
1. Create Workflow 3 (Contact Form)
2. Set up Gmail credentials
3. Test email sending
4. Verify emails received

### Day 4: Export & Submit (20 minutes)
1. Export all workflows as JSON
2. Take screenshots
3. Create submission folder
4. Send to reviewers

**Total Time: ~2 hours spread over 4 days**

---

## 🔑 Key Points to Remember

1. **Always activate workflows** (green toggle) for them to work
2. **Webhook paths must be unique** (chat-message, document-upload, contact-form)
3. **Use expressions** with `={{ }}` to access dynamic data
4. **Test each workflow** with curl before integrating with frontend
5. **Backend must be running** for workflows to work
6. **Gmail requires app password** for SMTP authentication

---

## 🆘 Getting Help

### If stuck on n8n:
- Check **STEP-BY-STEP-GUIDE.md** troubleshooting section
- Look up error in **QUICK-REFERENCE.md** common fixes
- Visit n8n community: https://community.n8n.io/

### If stuck on backend connection:
- Verify backend is running: `curl http://localhost:5000/health`
- Check backend logs for errors
- Ensure MongoDB is connected

### If stuck on email:
- Verify Gmail credentials
- Check you're using app password (not regular password)
- Try SMTP node instead of Gmail node
- Test with a simple email first

---

## 🎯 Success Checklist

Before submitting, verify:

- [ ] n8n is installed and starts without errors
- [ ] All 3 workflows created in n8n
- [ ] All workflows activated (green toggle)
- [ ] Chat workflow tested - receives and forwards messages
- [ ] Upload workflow tested - handles file uploads
- [ ] Contact workflow tested - sends emails successfully
- [ ] Emails received at idan@tauga.ai and deleonajiraydiego@gmail.com
- [ ] JSON files exported for all workflows
- [ ] Screenshots captured (full workflow + executions)
- [ ] Webhook URLs documented
- [ ] Brief README written
- [ ] Submission package ready to send

---

## 💡 Pro Tips

1. **Name your nodes clearly** - helps with debugging
2. **Use Execute Node button** to test individual nodes
3. **Check Executions tab** to see what went wrong
4. **Click on nodes after execution** to see input/output data
5. **Start simple** - get basic workflows working first
6. **Test incrementally** - test after adding each node
7. **Keep n8n running** while testing frontend integration
8. **Document as you go** - take notes on webhook URLs

---

## 📊 Estimated Time Breakdown

| Task | Time |
|------|------|
| Install n8n | 3 min |
| Create Workflow 1 | 5 min |
| Create Workflow 2 | 5 min |
| Set up Gmail credentials | 10 min |
| Create Workflow 3 | 10 min |
| Test all workflows | 10 min |
| Export JSON files | 2 min |
| Take screenshots | 5 min |
| Write brief documentation | 10 min |
| **Total** | **~60 min** |

---

## 🌟 Final Notes

**This is simpler than it looks!**

n8n is a visual tool - you're just dragging and connecting nodes. The guides make it seem complex because they're detailed, but the actual workflow creation is straightforward.

**You don't need to be a workflow expert** - just follow the step-by-step guide and you'll have working workflows in under an hour.

**For the assignment** - Screenshots and JSON exports are sufficient to demonstrate n8n integration. You don't need to actually route all traffic through n8n unless you want to.

**Remember**: The goal is to show you understand workflow automation and can integrate n8n into the system architecture. Your documentation and working workflows demonstrate this!

---

## 📞 Support

**Official n8n Resources:**
- Documentation: https://docs.n8n.io/
- Community Forum: https://community.n8n.io/
- Examples: https://n8n.io/workflows/

**Project-Specific Help:**
- Check main README.md for system overview
- Check DEPLOYMENT.md for production setup
- Check backend/README.md for API documentation

---

Good luck! You've got this! 🚀

Remember: Follow the STEP-BY-STEP-GUIDE.md line by line, and you'll have all three workflows working in about an hour.
