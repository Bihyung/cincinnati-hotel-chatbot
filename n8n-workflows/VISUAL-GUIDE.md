# n8n Visual Workflow Diagrams

This document shows what your n8n workflows should look like when completed.

## Workflow 1: Chat Message Handler

```
┌─────────────────────────────────────────────────────────────────┐
│                    CHAT MESSAGE HANDLER                         │
└─────────────────────────────────────────────────────────────────┘

┌──────────────┐         ┌──────────────┐
│   Webhook    │────────▶│ HTTP Request │
│              │         │              │
│ POST         │         │ POST to:     │
│ /chat-       │         │ /api/chat/   │
│  message     │         │  message     │
│              │         │              │
│ Receives:    │         │ Sends:       │
│ - sessionId  │         │ - sessionId  │
│ - message    │         │ - message    │
└──────────────┘         └──────────────┘
                                │
                                ▼
                         ┌──────────────┐
                         │   Response   │
                         │   (SSE)      │
                         │              │
                         │ Returns AI   │
                         │ streaming    │
                         │ response     │
                         └──────────────┘
```

### Node Configuration Details:

**Webhook Node:**
- HTTP Method: POST
- Path: chat-message
- Respond: When Last Node Finishes
- Authentication: None

**HTTP Request Node:**
- Method: POST
- URL: http://localhost:5000/api/chat/message
- Body (JSON):
  {
    "sessionId": "={{ $json.sessionId }}",
    "message": "={{ $json.message }}"
  }

---

## Workflow 2: Document Upload Handler

```
┌─────────────────────────────────────────────────────────────────┐
│                 DOCUMENT UPLOAD HANDLER                         │
└─────────────────────────────────────────────────────────────────┘

┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│   Webhook    │────────▶│ HTTP Request │────────▶│     Set      │
│              │         │              │         │              │
│ POST         │         │ POST to:     │         │ Format       │
│ /document-   │         │ /api/        │         │ Response     │
│  upload      │         │  document/   │         │              │
│              │         │  upload      │         │ Returns:     │
│ Receives:    │         │              │         │ - success    │
│ - file       │         │ Sends:       │         │ - filename   │
│  (binary)    │         │ - file       │         │ - chunks     │
│              │         │  (form-data) │         │              │
└──────────────┘         └──────────────┘         └──────────────┘
```

### Node Configuration Details:

**Webhook Node:**
- HTTP Method: POST
- Path: document-upload
- Binary Data: ON
- Respond: When Last Node Finishes
- Authentication: None

**HTTP Request Node:**
- Method: POST
- URL: http://localhost:5000/api/document/upload
- Body Content Type: Form-Data
- Body Parameter:
  - Name: file
  - Value: =data (binary)

**Set Node (Optional):**
- Field 1:
  - Name: message
  - Value: "Document uploaded successfully"
- Field 2:
  - Name: filename
  - Value: ={{ $json.filename }}
- Field 3:
  - Name: chunks
  - Value: ={{ $json.chunks }}

---

## Workflow 3: Contact Form Handler

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        CONTACT FORM HANDLER                                 │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Webhook    │───▶│ HTTP Request │───▶│    Gmail     │───▶│  Respond to  │
│              │    │              │    │              │    │   Webhook    │
│ POST         │    │ POST to:     │    │ Send Email   │    │              │
│ /contact-    │    │ /api/chat/   │    │              │    │ Returns:     │
│  form        │    │  contact     │    │ To:          │    │ - success    │
│              │    │              │    │ idan@tauga   │    │ - message    │
│ Receives:    │    │ Sends:       │    │ deleonaj...  │    │              │
│ - sessionId  │    │ - sessionId  │    │              │    │              │
│ - name       │    │ - name       │    │ Subject:     │    │              │
│ - phone      │    │ - phone      │    │ Contact Req  │    │              │
│ - email      │    │ - email      │    │              │    │              │
│ - question   │    │ - question   │    │ Body: HTML   │    │              │
└──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘
```

### Node Configuration Details:

**Webhook Node:**
- HTTP Method: POST
- Path: contact-form
- Respond: When Last Node Finishes
- Authentication: None

**HTTP Request Node:**
- Method: POST
- URL: http://localhost:5000/api/chat/contact
- Body (JSON):
  {
    "sessionId": "={{ $json.sessionId }}",
    "name": "={{ $json.name }}",
    "phone": "={{ $json.phone }}",
    "email": "={{ $json.email }}",
    "question": "={{ $json.question }}"
  }

**Gmail Node:**
- To: idan@tauga.ai, deleonajiraydiego@gmail.com
- Subject: Cincinnati Hotel - Contact Request from ={{ $node["Webhook"].json["name"] }}
- Email Type: HTML
- Message: (See HTML template below)

**Respond to Webhook Node:**
- Response Body (JSON):
  {
    "success": true,
    "message": "Contact form submitted successfully"
  }

---

## Complete System Architecture with n8n

```
┌────────────────────────────────────────────────────────────────────────┐
│                         FULL SYSTEM FLOW                               │
└────────────────────────────────────────────────────────────────────────┘

                        ┌─────────────────┐
                        │  React Frontend │
                        │  localhost:3000 │
                        └────────┬────────┘
                                 │
                    ┌────────────┼────────────┐
                    │            │            │
                    ▼            ▼            ▼
         ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
         │ Chat Message │ │  Doc Upload  │ │ Contact Form │
         │   Webhook    │ │   Webhook    │ │   Webhook    │
         └──────┬───────┘ └──────┬───────┘ └──────┬───────┘
                │                │                │
                │    n8n         │    n8n         │    n8n
                │  localhost     │  localhost     │  localhost
                │    :5678       │    :5678       │    :5678
                │                │                │
                ▼                ▼                ▼
         ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
         │ HTTP Request │ │ HTTP Request │ │ HTTP Request │
         └──────┬───────┘ └──────┬───────┘ └──────┬───────┘
                │                │                │
                └────────────────┼────────────────┘
                                 │
                                 ▼
                        ┌─────────────────┐
                        │  Express Backend│
                        │  localhost:5000 │
                        └────────┬────────┘
                                 │
                    ┌────────────┼────────────┐
                    │            │            │
                    ▼            ▼            ▼
            ┌───────────┐  ┌─────────┐  ┌─────────┐
            │  MongoDB  │  │ OpenAI  │  │  Gmail  │
            │ :27017    │  │   API   │  │  SMTP   │
            └───────────┘  └─────────┘  └─────────┘
```

---

## What Each Workflow Looks Like in n8n UI

### When You're Creating the Workflow:

```
┌─────────────────────────────────────────────────────────────────┐
│  Chat Message Handler                    [Save] [▶ Execute]  ☰  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│                                                                  │
│    ┌──────────┐                    ┌──────────┐                │
│    │ Webhook  │ ─────────────────▶ │   HTTP   │                │
│    │          │                    │  Request │                │
│    │   📥     │                    │    🌐    │                │
│    └──────────┘                    └──────────┘                │
│       (green)                         (blue)                    │
│                                                                  │
│                                                                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### When Workflow is Executing:

```
┌─────────────────────────────────────────────────────────────────┐
│  Chat Message Handler                    [Save] [▶ Execute]  ☰  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│                                                                  │
│    ┌──────────┐                    ┌──────────┐                │
│    │ Webhook  │ ─────────────────▶ │   HTTP   │                │
│    │          │                    │  Request │                │
│    │   ✓      │                    │    ⟳     │                │
│    └──────────┘                    └──────────┘                │
│    (green ✓)                       (spinning)                   │
│                                                                  │
│                                                                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### When Workflow Completes Successfully:

```
┌─────────────────────────────────────────────────────────────────┐
│  Chat Message Handler                    [Save] [▶ Execute]  ☰  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│                                                                  │
│    ┌──────────┐                    ┌──────────┐                │
│    │ Webhook  │ ─────────────────▶ │   HTTP   │                │
│    │          │                    │  Request │                │
│    │    ✓     │                    │     ✓    │                │
│    └──────────┘                    └──────────┘                │
│    (green ✓)                       (green ✓)                    │
│                                                                  │
│  ✓ Execution successful                                         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Email Template for Contact Form

When configuring the Gmail node, use this HTML:

```html
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #0284c7; color: white; padding: 20px; }
        .content { background: #f9fafb; padding: 20px; }
        .details { background: white; padding: 15px; margin: 10px 0; }
        .footer { color: #666; font-size: 12px; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏨 Cincinnati Hotel</h1>
            <h2>Guest Contact Request</h2>
        </div>
        
        <div class="content">
            <p>A guest has submitted a contact form because the AI assistant could not answer their question.</p>
            
            <div class="details">
                <h3>📋 Contact Details:</h3>
                <ul>
                    <li><strong>Name:</strong> {{ $node["Webhook"].json["name"] }}</li>
                    <li><strong>Phone:</strong> {{ $node["Webhook"].json["phone"] }}</li>
                    <li><strong>Email:</strong> {{ $node["Webhook"].json["email"] }}</li>
                </ul>
            </div>
            
            <div class="details">
                <h3>❓ Question That Couldn't Be Answered:</h3>
                <p style="background: #fef3c7; padding: 10px; border-left: 4px solid #f59e0b;">
                    {{ $node["Webhook"].json["question"] }}
                </p>
            </div>
            
            <div class="details">
                <h3>🔍 Session Information:</h3>
                <p><strong>Session ID:</strong> {{ $node["Webhook"].json["sessionId"] }}</p>
                <p><strong>Timestamp:</strong> {{ $now.format('YYYY-MM-DD HH:mm:ss') }}</p>
            </div>
            
            <div class="footer">
                <hr>
                <p><em>⚠️ This is an automated notification from Cincinnati Hotel Chatbot System.</em></p>
                <p><em>✅ Please follow up with this guest as soon as possible.</em></p>
            </div>
        </div>
    </div>
</body>
</html>
```

---

## Quick Checklist: What to Click

### Creating Webhook Node:
1. ✅ Click "+ Add first step"
2. ✅ Type "webhook"
3. ✅ Click "Webhook"
4. ✅ Set Method to "POST"
5. ✅ Set Path (e.g., "chat-message")
6. ✅ Set Respond to "When Last Node Finishes"
7. ✅ For file upload: Toggle "Binary Data" ON

### Creating HTTP Request Node:
1. ✅ Click "+" on canvas
2. ✅ Type "HTTP Request"
3. ✅ Click "HTTP Request"
4. ✅ Set Method to "POST"
5. ✅ Set URL (e.g., http://localhost:5000/api/...)
6. ✅ Toggle "Send Body" ON
7. ✅ Set Body Content Type to "JSON" or "Form-Data"
8. ✅ Add JSON or Form-Data parameters

### Creating Gmail Node:
1. ✅ Click "+" on canvas
2. ✅ Type "Gmail"
3. ✅ Click "Gmail"
4. ✅ Create/Select credential
5. ✅ Set "To" addresses
6. ✅ Set "Subject"
7. ✅ Set "Email Type" to "HTML"
8. ✅ Paste HTML message

### Connecting Nodes:
1. ✅ Drag from dot on right of node
2. ✅ Drop on dot on left of next node
3. ✅ Or nodes auto-connect when created with "+"

### Saving & Activating:
1. ✅ Click "Save" button (top right)
2. ✅ Toggle "Activate" (top right)
3. ✅ Toggle should turn GREEN

---

## Common Questions

**Q: Do I need to restart n8n after creating workflows?**
A: No, just activate the workflow (toggle should be green).

**Q: Can I test without activating?**
A: Yes! Click "Execute Workflow" button while in workflow edit mode.

**Q: How do I see what data each node receives?**
A: Click on the node after execution. You'll see "Input" and "Output" tabs.

**Q: Can I edit a workflow after activating?**
A: Yes! Changes are saved immediately. But deactivate first if making major changes.

**Q: Where are my webhook URLs?**
A: Click on Webhook node → See "Production URL" at bottom.

**Q: How do I copy webhook URL?**
A: Click the copy icon 📋 next to Production URL.

**Q: Can I rename a workflow?**
A: Yes! Click the workflow name at top and type new name.

**Q: How do I delete a node?**
A: Select node → Press Delete key, or right-click → Delete.

**Q: How do I duplicate a workflow?**
A: Open workflow → Click "..." → Duplicate workflow.

**Q: Where can I see execution history?**
A: Click "Executions" in left sidebar.

---

## Screenshot Examples

When taking screenshots for submission, capture:

1. **Full Workflow View:**
   - Zoom out to show all nodes
   - Make sure all nodes are visible
   - Show workflow name at top
   - Show activated toggle (green)

2. **Node Configuration:**
   - Open node settings
   - Show all configured parameters
   - Capture JSON/HTML content

3. **Successful Execution:**
   - After test execution
   - Show green checkmarks on all nodes
   - Click each node to show input/output data

4. **Execution Details:**
   - Go to "Executions" tab
   - Click on successful execution
   - Show execution time
   - Show data flow

---

Good luck creating your workflows! Follow the step-by-step guide and you'll have all three workflows running in about 30-45 minutes! 🚀
