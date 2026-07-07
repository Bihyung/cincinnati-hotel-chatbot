# n8n Workflow Creation Guide - Step by Step

This guide will walk you through creating all three n8n workflows for the Cincinnati Hotel Chatbot, click by click.

## Table of Contents
1. [Installing and Starting n8n](#installing-and-starting-n8n)
2. [Understanding n8n Interface](#understanding-n8n-interface)
3. [Workflow 1: Chat Message Handler](#workflow-1-chat-message-handler)
4. [Workflow 2: Document Upload Handler](#workflow-2-document-upload-handler)
5. [Workflow 3: Contact Form Handler](#workflow-3-contact-form-handler)
6. [Testing Your Workflows](#testing-your-workflows)
7. [Updating Frontend to Use n8n](#updating-frontend-to-use-n8n)
8. [Troubleshooting](#troubleshooting)

---

## Installing and Starting n8n

### Step 1: Install n8n

Open terminal and run:
```bash
npm install -g n8n
```

Wait for installation to complete (~2-3 minutes).

### Step 2: Start n8n

```bash
n8n start
```

You should see:
```
Editor is now accessible via:
http://localhost:5678/
```

### Step 3: Open n8n

1. Open browser
2. Go to: **http://localhost:5678**
3. First time: Create account (email + password)
4. You'll see the n8n main dashboard

---

## Understanding n8n Interface

When you open n8n, you'll see:

**Left Sidebar:**
- 🏠 **Home** - Dashboard
- 📋 **Workflows** - List of your workflows
- ⚙️ **Credentials** - Saved API keys/passwords
- 📊 **Executions** - Workflow run history

**Main Area:**
- Canvas where you build workflows
- Nodes connect to create flow

**Top Bar:**
- **Workflow name** (click to rename)
- **Save** button
- **Execute Workflow** button (play icon)
- **Activate/Deactivate** toggle

---

## Workflow 1: Chat Message Handler

This workflow receives chat messages from frontend and forwards them to backend API.

### Step 1: Create New Workflow

1. Click **"Workflows"** in left sidebar
2. Click **"+ Create New Workflow"** button (top right)
3. You'll see empty canvas

### Step 2: Rename Workflow

1. Click **"My workflow"** at top
2. Type: **"Chat Message Handler"**
3. Press Enter

### Step 3: Add Webhook Trigger

1. Click **"+ Add first step"** in center of canvas
2. In search box, type: **"webhook"**
3. Click **"Webhook"** node

#### Configure Webhook:

1. **HTTP Method**: Select **"POST"**
2. **Path**: Type **"chat-message"**
3. **Authentication**: Select **"None"**
4. **Respond**: Select **"When Last Node Finishes"**
5. Click **"Execute Node"** button (bottom right)

You'll see: "Waiting for webhook call..."

**Keep this open!** We'll test it later.

### Step 4: Add HTTP Request Node

1. Click **"+"** button on the right side of Webhook node (or on canvas)
2. Search for: **"HTTP Request"**
3. Click **"HTTP Request"** node

#### Configure HTTP Request:

1. **Method**: Select **"POST"**
2. **URL**: Type **"http://localhost:5000/api/chat/message"**
3. Click **"Add Parameter"** under "Body"
4. Select **"JSON"**
5. In JSON editor, paste:
```json
{
  "sessionId": "={{ $json.sessionId }}",
  "message": "={{ $json.message }}"
}
```

**Explanation**: 
- `$json.sessionId` takes sessionId from webhook
- `$json.message` takes message from webhook

6. Scroll down to **"Options"**
7. Click **"Add Option"** → Select **"Response"** → Select **"Include Response Headers and Status"**

### Step 5: Connect Nodes

1. The nodes should auto-connect
2. If not: Drag from the **dot** on right side of Webhook to left side of HTTP Request

### Step 6: Save Workflow

1. Click **"Save"** button (top right)
2. Click **"Activate"** toggle (top right) - should turn GREEN

### Step 7: Get Webhook URL

1. Click on **Webhook node**
2. Look at **"Production URL"** - copy it
3. Should look like: `http://localhost:5678/webhook/chat-message`

**Save this URL!** You'll need it to update frontend.

---

## Workflow 2: Document Upload Handler

This workflow handles PDF uploads from admin.

### Step 1: Create New Workflow

1. Click **"Workflows"** (left sidebar)
2. Click **"+ Create New Workflow"**
3. Rename to: **"Document Upload Handler"**

### Step 2: Add Webhook Trigger

1. Click **"+ Add first step"**
2. Search: **"webhook"**
3. Click **"Webhook"**

#### Configure:

1. **HTTP Method**: **"POST"**
2. **Path**: **"document-upload"**
3. **Authentication**: **"None"**
4. **Respond**: **"When Last Node Finishes"**
5. **Options** → **Add Option** → **"Binary Data"**: Toggle ON

### Step 3: Add HTTP Request for Upload

1. Click **"+"** after Webhook
2. Search: **"HTTP Request"**
3. Click **"HTTP Request"**

#### Configure:

1. **Method**: **"POST"**
2. **URL**: **"http://localhost:5000/api/document/upload"**
3. **Send Body**: Toggle **ON**
4. **Body Content Type**: Select **"Form-Data"**
5. Click **"Add Parameter"** under "Body Parameters"
6. **Name**: **"file"**
7. **Value**: Click the gear icon ⚙️ → Select **"Binary Data"**
8. In the field: Type **"data"** (this is the binary property name)

### Step 4: Add Response Formatting (Optional)

1. Click **"+"** after HTTP Request
2. Search: **"Set"**
3. Click **"Set"** node

#### Configure:

1. Click **"Add Value"**
2. **Type**: Select **"String"**
3. **Name**: **"message"**
4. **Value**: **"Document uploaded successfully"**

5. Click **"Add Value"** again
6. **Type**: **"String"**
7. **Name**: **"filename"**
8. **Value**: **"={{ $json.filename }}"**

9. Click **"Add Value"** again
10. **Type**: **"Number"**
11. **Name**: **"chunks"**
12. **Value**: **"={{ $json.chunks }}"**

### Step 5: Save and Activate

1. Click **"Save"**
2. Click **"Activate"** toggle
3. Copy **Production URL** from Webhook node
4. Should be: `http://localhost:5678/webhook/document-upload`

---

## Workflow 3: Contact Form Handler

This workflow receives contact form submissions and sends emails.

### Step 1: Create New Workflow

1. **Workflows** → **Create New Workflow**
2. Rename: **"Contact Form Handler"**

### Step 2: Add Webhook Trigger

1. **"+ Add first step"**
2. Search: **"webhook"**
3. Select **"Webhook"**

#### Configure:

1. **HTTP Method**: **"POST"**
2. **Path**: **"contact-form"**
3. **Authentication**: **"None"**
4. **Respond**: **"When Last Node Finishes"**

### Step 3: Add HTTP Request to Backend

1. Click **"+"** after Webhook
2. Search: **"HTTP Request"**
3. Select **"HTTP Request"**

#### Configure:

1. **Method**: **"POST"**
2. **URL**: **"http://localhost:5000/api/chat/contact"**
3. **Send Body**: Toggle **ON**
4. **Body Content Type**: **"JSON"**
5. **JSON**:
```json
{
  "sessionId": "={{ $json.sessionId }}",
  "name": "={{ $json.name }}",
  "phone": "={{ $json.phone }}",
  "email": "={{ $json.email }}",
  "question": "={{ $json.question }}"
}
```

### Step 4: Add Email Node

1. Click **"+"** after HTTP Request
2. Search: **"Gmail"** (or **"Send Email"**)
3. Select **"Gmail"** node

#### Configure Gmail Credentials (First Time):

1. Click **"Create New Credential"**
2. You'll see options:
   - **Option A: OAuth2** (Recommended)
   - **Option B: Service Account**

**For Gmail OAuth2:**

1. Click **"Connect my account"**
2. Sign in with Google account
3. Allow n8n access
4. Return to n8n

**For Gmail Service Account (Alternative):**

1. Use SMTP credentials instead
2. Search for **"SMTP"** node instead of Gmail
3. Configure:
   - Host: `smtp.gmail.com`
   - Port: `587`
   - User: Your email
   - Password: App password (from Gmail settings)

#### Configure Email Content:

1. **To**: **"idan@tauga.ai, deleonajiraydiego@gmail.com"**
2. **Subject**: **"Cincinnati Hotel - Contact Request from ={{ $node["Webhook"].json["name"] }}"**
3. **Email Type**: **"HTML"**
4. **Message**: Paste this HTML:

```html
<h2>Cincinnati Hotel - Guest Contact Request</h2>
<p>A guest has submitted a contact form because the AI assistant could not answer their question.</p>

<h3>Contact Details:</h3>
<ul>
  <li><strong>Name:</strong> {{ $node["Webhook"].json["name"] }}</li>
  <li><strong>Phone:</strong> {{ $node["Webhook"].json["phone"] }}</li>
  <li><strong>Email:</strong> {{ $node["Webhook"].json["email"] }}</li>
</ul>

<h3>Question That Couldn't Be Answered:</h3>
<p>{{ $node["Webhook"].json["question"] }}</p>

<h3>Session Information:</h3>
<p><strong>Session ID:</strong> {{ $node["Webhook"].json["sessionId"] }}</p>

<hr>
<p style="color: #666; font-size: 12px;"><em>This is an automated notification from Cincinnati Hotel Chatbot System.</em></p>
<p style="color: #666; font-size: 12px;"><em>Please follow up with this guest as soon as possible.</em></p>
```

### Step 5: Add Final Response Node

1. Click **"+"** after Gmail node
2. Search: **"Respond to Webhook"**
3. Select **"Respond to Webhook"**

#### Configure:

1. **Respond With**: **"JSON"**
2. **Response Body**:
```json
{
  "success": true,
  "message": "Contact form submitted successfully. Our team will reach out to you shortly."
}
```

### Step 6: Save and Activate

1. Click **"Save"**
2. Click **"Activate"** toggle
3. Copy **Production URL**: `http://localhost:5678/webhook/contact-form`

---

## Testing Your Workflows

### Test Workflow 1: Chat Message

1. Open workflow in n8n
2. Click **Webhook node**
3. Click **"Execute Node"**
4. You'll see: "Waiting for webhook call..."

**In new terminal:**
```bash
curl -X POST http://localhost:5678/webhook/chat-message \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "test-123",
    "message": "What are your room rates?"
  }'
```

**Expected**: You should see the response in terminal and execution completes in n8n.

### Test Workflow 2: Document Upload

1. **First, make sure backend is running** (`npm run dev` in backend folder)

2. Open workflow in n8n
3. Click **Webhook node**
4. Click **"Execute Node"**

**In terminal:**
```bash
curl -X POST http://localhost:5678/webhook/document-upload \
  -F "file=@sample-hotel-info.txt"
```

**Expected**: Document uploads and you see success message.

### Test Workflow 3: Contact Form

1. Open workflow in n8n
2. Click **Webhook node**
3. Click **"Execute Node"**

**In terminal:**
```bash
curl -X POST http://localhost:5678/webhook/contact-form \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "test-456",
    "name": "John Doe",
    "phone": "555-1234",
    "email": "john@example.com",
    "question": "Do you have a helipad?"
  }'
```

**Expected**: Email sent to idan@tauga.ai and deleonajiraydiego@gmail.com

---

## Updating Frontend to Use n8n

Now that workflows are ready, update frontend to use n8n webhooks instead of direct backend calls.

### Option 1: Use n8n as Proxy (Full Integration)

Edit `frontend/src/services/api.js`:

```javascript
// Change this line:
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// To this:
const N8N_URL = 'http://localhost:5678/webhook';
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
```

Then update specific functions:

```javascript
// For chat messages
export const sendMessage = (sessionId, message, onChunk, onDone, onError) => {
  const url = `${N8N_URL}/chat-message`; // Changed from ${BASE_URL}/api/chat/message
  // ... rest of code
};

// For document upload
export const uploadDocument = async (file, onProgress) => {
  const formData = new FormData();
  formData.append('file', file);
  
  return axios.post(`${N8N_URL}/document-upload`, formData, { // Changed URL
    // ... rest of code
  });
};

// For contact form
export const submitContactForm = async (sessionId, formData) => {
  return axios.post(`${N8N_URL}/contact-form`, { // Changed URL
    sessionId,
    ...formData
  });
};
```

### Option 2: Keep Direct Backend (Simpler)

Keep using direct backend calls for now. n8n workflows are ready but not actively used. This is fine for testing!

---

## Exporting Workflows for Submission

### Step 1: Export Each Workflow

For each workflow:

1. Open workflow in n8n
2. Click **"..."** menu (three dots, top right)
3. Select **"Download"**
4. Save as:
   - `chat-message-workflow.json`
   - `document-upload-workflow.json`
   - `contact-form-workflow.json`

### Step 2: Take Screenshots

For each workflow:

1. Zoom out to see all nodes: `Ctrl + -` (Windows) or `Cmd + -` (Mac)
2. Take screenshot of entire workflow
3. Save as:
   - `chat-message-workflow.png`
   - `document-upload-workflow.png`
   - `contact-form-workflow.png`

### Step 3: Export Execution Examples

1. Run each workflow successfully (see Testing section)
2. Go to **"Executions"** tab (left sidebar)
3. Click on successful execution
4. Take screenshot showing:
   - Input data
   - Each node's output
   - Success status

---

## Troubleshooting

### Problem: "Webhook not found"

**Solution:**
1. Make sure workflow is **Activated** (toggle is green)
2. Check webhook path is correct
3. Restart n8n: `Ctrl+C` then `n8n start`

### Problem: "HTTP Request failed - Connection refused"

**Solution:**
1. Make sure backend is running: `cd backend && npm run dev`
2. Check backend URL is correct: `http://localhost:5000`
3. Test backend directly: `curl http://localhost:5000/health`

### Problem: "Email not sending"

**Solution:**
1. Check Gmail credentials are correct
2. If using OAuth: Re-authenticate
3. If using SMTP: Check app password is valid
4. Try using SMTP node instead of Gmail node

### Problem: "Binary data not working for file upload"

**Solution:**
1. In Webhook node: Make sure "Binary Data" option is ON
2. In HTTP Request: Make sure "Form-Data" is selected
3. In HTTP Request: Binary property should be "data"
4. Test with curl command first

### Problem: "Can't access n8n from frontend"

**Solution:**
1. CORS issue - n8n doesn't have CORS enabled by default
2. Option A: Run n8n with CORS enabled:
   ```bash
   export N8N_CORS_ALLOW_ORIGIN="http://localhost:3000"
   n8n start
   ```
3. Option B: Keep using direct backend (recommended for now)

### Problem: "Workflow executes but returns error"

**Solution:**
1. Click on the red node to see error
2. Check **"Executions"** tab for detailed logs
3. Common issues:
   - Wrong JSON format
   - Missing required fields
   - Backend endpoint not matching
   - Network/connection issues

---

## Advanced: n8n Cloud Deployment

If you want to deploy to production:

### Step 1: Sign Up for n8n Cloud

1. Go to https://n8n.io/cloud/
2. Create account (14-day free trial)
3. Choose plan (Starter - $20/month)

### Step 2: Import Workflows

1. In n8n Cloud dashboard
2. Create new workflow
3. Click "..." → "Import from File"
4. Select your exported JSON files

### Step 3: Update Webhook URLs

1. Production URLs will be: `https://your-instance.app.n8n.cloud/webhook/...`
2. Update frontend `api.js` with new URLs
3. Update any curl tests

### Step 4: Configure Credentials

1. Add Gmail credentials in n8n Cloud
2. Test each workflow

---

## Quick Reference - Node Types Used

### Webhook Node
- **Purpose**: Receives HTTP requests
- **Use**: Entry point for all workflows
- **Key Settings**: Method, Path, Authentication

### HTTP Request Node
- **Purpose**: Make API calls to backend
- **Use**: Forward requests to Express server
- **Key Settings**: Method, URL, Body

### Gmail / SMTP Node
- **Purpose**: Send emails
- **Use**: Notify staff of contact form
- **Key Settings**: To, Subject, Message

### Set Node
- **Purpose**: Transform/format data
- **Use**: Clean up response data
- **Key Settings**: Field names and values

### Respond to Webhook Node
- **Purpose**: Send response back to caller
- **Use**: Return data to frontend
- **Key Settings**: Response body

---

## Checklist: Before Submission

- [ ] All 3 workflows created in n8n
- [ ] All workflows activated (green toggle)
- [ ] All workflows tested successfully
- [ ] Screenshots taken of each workflow
- [ ] JSON files exported for each workflow
- [ ] Execution screenshots captured
- [ ] Webhook URLs documented
- [ ] (Optional) Frontend updated to use n8n
- [ ] n8n running and accessible
- [ ] Backend running and responding
- [ ] Email notifications working

---

## What to Include in Submission

1. **Screenshots folder** containing:
   - `chat-message-workflow.png`
   - `document-upload-workflow.png`
   - `contact-form-workflow.png`
   - `chat-message-execution.png`
   - `document-upload-execution.png`
   - `contact-form-execution.png`

2. **JSON exports folder** containing:
   - `chat-message-workflow.json`
   - `document-upload-workflow.json`
   - `contact-form-workflow.json`

3. **README** explaining:
   - How to import workflows
   - Webhook URLs to use
   - How to test each workflow

4. **Email** to idan@tauga.ai and deleonajiraydiego@gmail.com with:
   - Link to screenshots (Google Drive/Dropbox)
   - Link to JSON files
   - (Optional) n8n Cloud access if using cloud version

---

## Summary

You've created 3 n8n workflows:

1. **Chat Message Handler** - Routes chat messages to backend
2. **Document Upload Handler** - Handles PDF uploads
3. **Contact Form Handler** - Sends email notifications

**Workflow Flow**:
```
Frontend → n8n Webhook → n8n HTTP Request → Backend API → Response → Frontend
```

**For Production**: Deploy n8n to cloud and update webhook URLs in frontend.

**For Assignment**: Screenshots + JSON exports are enough to demonstrate n8n integration!

---

Need help? Check the troubleshooting section or test each component individually!
