# n8n Quick Reference Card

## 🚀 Start n8n
```bash
n8n start
```
Open: http://localhost:5678

---

## 📋 Workflow 1: Chat Message Handler

**Path**: `/webhook/chat-message`

| Step | Action | Settings |
|------|--------|----------|
| 1 | Add Webhook | Method: POST, Path: chat-message |
| 2 | Add HTTP Request | URL: http://localhost:5000/api/chat/message |
| 3 | Configure Body | JSON: `{"sessionId": "={{ $json.sessionId }}", "message": "={{ $json.message }}"}` |
| 4 | Save & Activate | Toggle to GREEN |

**Test:**
```bash
curl -X POST http://localhost:5678/webhook/chat-message \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"test-123","message":"What are your rates?"}'
```

---

## 📄 Workflow 2: Document Upload Handler

**Path**: `/webhook/document-upload`

| Step | Action | Settings |
|------|--------|----------|
| 1 | Add Webhook | Method: POST, Path: document-upload, Binary Data: ON |
| 2 | Add HTTP Request | URL: http://localhost:5000/api/document/upload |
| 3 | Configure Body | Form-Data: file = data (binary) |
| 4 | (Optional) Add Set Node | Format response |
| 5 | Save & Activate | Toggle to GREEN |

**Test:**
```bash
curl -X POST http://localhost:5678/webhook/document-upload \
  -F "file=@sample-hotel-info.txt"
```

---

## 📧 Workflow 3: Contact Form Handler

**Path**: `/webhook/contact-form`

| Step | Action | Settings |
|------|--------|----------|
| 1 | Add Webhook | Method: POST, Path: contact-form |
| 2 | Add HTTP Request | URL: http://localhost:5000/api/chat/contact |
| 3 | Configure Body | JSON with sessionId, name, phone, email, question |
| 4 | Add Gmail/SMTP | To: idan@tauga.ai, deleonajiraydiego@gmail.com |
| 5 | Add Respond to Webhook | Return success message |
| 6 | Save & Activate | Toggle to GREEN |

**Test:**
```bash
curl -X POST http://localhost:5678/webhook/contact-form \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"test-456","name":"John","phone":"555-1234","email":"john@example.com","question":"Do you have a pool?"}'
```

---

## 🎯 Common n8n Expressions

| Expression | Description | Example |
|------------|-------------|---------|
| `{{ $json.fieldName }}` | Get field from input | `{{ $json.sessionId }}` |
| `{{ $node["NodeName"].json["field"] }}` | Get field from specific node | `{{ $node["Webhook"].json["name"] }}` |
| `{{ $now.format('YYYY-MM-DD') }}` | Current date | `{{ $now.format('YYYY-MM-DD HH:mm:ss') }}` |
| `={{ expression }}` | Expression mode | `={{ $json.sessionId }}` |

---

## 🔧 Troubleshooting Quick Fixes

| Problem | Quick Fix |
|---------|-----------|
| Webhook not found | Activate workflow (toggle GREEN) |
| Connection refused | Start backend: `cd backend && npm run dev` |
| Binary data error | Toggle "Binary Data" ON in Webhook node |
| Email not sending | Check Gmail credentials, use app password |
| CORS error | Add: `export N8N_CORS_ALLOW_ORIGIN="http://localhost:3000"` before n8n start |

---

## 📸 For Submission

1. **Export workflows:**
   - Workflow → "..." → Download
   - Save as: `workflow-name.json`

2. **Take screenshots:**
   - Full workflow view (zoomed out)
   - Each node's configuration
   - Successful execution (green ✓)
   - Execution details from "Executions" tab

3. **Test all workflows:**
   - Run curl commands
   - Verify outputs
   - Check emails received

---

## 🌐 Webhook URLs Summary

After creating all workflows, you'll have:

```
Chat:     http://localhost:5678/webhook/chat-message
Upload:   http://localhost:5678/webhook/document-upload
Contact:  http://localhost:5678/webhook/contact-form
```

---

## ⚡ Speed Run Checklist

- [ ] Install: `npm install -g n8n`
- [ ] Start: `n8n start`
- [ ] Create Workflow 1 (5 min)
- [ ] Create Workflow 2 (5 min)
- [ ] Create Workflow 3 (10 min - includes email setup)
- [ ] Test all 3 workflows (5 min)
- [ ] Export JSON files (2 min)
- [ ] Take screenshots (3 min)
- [ ] **Total: ~30 minutes**

---

## 🎓 Key Concepts

**Webhook** = Entry point (receives HTTP requests)  
**HTTP Request** = Makes calls to backend  
**Expression** = Dynamic values using `{{ }}` or `={{  }}`  
**Binary Data** = File uploads  
**Activation** = Green toggle = workflow is live  
**Execution** = One run of the workflow  

---

Print this card and keep it handy while building your workflows! 📝
