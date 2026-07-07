# n8n Workflows Setup Guide

This document explains how to set up n8n workflows for the Cincinnati Hotel Chatbot system.

## Installation

```bash
npm install -g n8n
```

## Starting n8n

```bash
# Start n8n
n8n start

# Or with custom port
n8n start --port 5678
```

Access n8n at: `http://localhost:5678`

## Required Workflows

### 1. Chat Message Workflow

**Purpose**: Handle chat messages from users to AI assistant

**Trigger**: Webhook
- Method: POST
- Path: `/webhook/chat/message`
- Response: Return to Webhook

**Nodes**:
1. **Webhook** (Trigger)
   - HTTP Method: POST
   - Path: `chat/message`
   - Response Mode: "When Last Node Finishes"

2. **HTTP Request** - Send to Backend
   - Method: POST
   - URL: `http://localhost:5000/api/chat/message`
   - Body:
     ```json
     {
       "sessionId": "{{ $json.sessionId }}",
       "message": "{{ $json.message }}"
     }
     ```
   - Response Format: Stream

3. **Respond to Webhook**
   - Return the streaming response

**Test**:
```bash
curl -X POST http://localhost:5678/webhook/chat/message \
  -H "Content-Type: application/json" \
  -d '{"sessionId": "test-123", "message": "What are your room rates?"}'
```

---

### 2. Document Upload Workflow

**Purpose**: Handle PDF document uploads from admin

**Trigger**: Webhook
- Method: POST  
- Path: `/webhook/document/upload`
- Response: Return to Webhook

**Nodes**:
1. **Webhook** (Trigger)
   - HTTP Method: POST
   - Path: `document/upload`
   - Response Mode: "When Last Node Finishes"

2. **HTTP Request** - Upload to Backend
   - Method: POST
   - URL: `http://localhost:5000/api/document/upload`
   - Body Type: Form-Data
   - Attach Binary Property: true
   - Binary Property: `file`

3. **Code Node** - Format Response
   ```javascript
   return [{
     json: {
       success: true,
       filename: $input.first().json.filename,
       chunks: $input.first().json.chunks,
       message: 'Document uploaded successfully'
     }
   }];
   ```

4. **Respond to Webhook**
   - Return formatted response

**Test**:
```bash
curl -X POST http://localhost:5678/webhook/document/upload \
  -F "file=@hotel-info.pdf"
```

---

### 3. Contact Form Workflow

**Purpose**: Process contact form submissions and send emails

**Trigger**: Webhook
- Method: POST
- Path: `/webhook/contact/submit`
- Response: Return to Webhook

**Nodes**:
1. **Webhook** (Trigger)
   - HTTP Method: POST
   - Path: `contact/submit`
   - Response Mode: "When Last Node Finishes"

2. **HTTP Request** - Submit to Backend
   - Method: POST
   - URL: `http://localhost:5000/api/chat/contact`
   - Body:
     ```json
     {
       "sessionId": "{{ $json.sessionId }}",
       "name": "{{ $json.name }}",
       "phone": "{{ $json.phone }}",
       "email": "{{ $json.email }}",
       "question": "{{ $json.question }}"
     }
     ```

3. **IF Node** - Check Success
   - Condition: `{{ $json.success }}` equals `true`

4. **Send Email** (Success Branch)
   - To: `idan@tauga.ai, deleonajiraydiego@gmail.com`
   - Subject: `Cincinnati Hotel - Contact Request from {{ $('Webhook').item.json.name }}`
   - Body: Use HTML template (see below)

5. **Respond to Webhook** (Merge branches)
   - Success: Return confirmation
   - Error: Return error message

**Email Template**:
```html
<h2>Cincinnati Hotel - Guest Contact Request</h2>
<p>A guest has submitted a contact form request.</p>

<h3>Contact Details:</h3>
<ul>
  <li><strong>Name:</strong> {{ $json.name }}</li>
  <li><strong>Phone:</strong> {{ $json.phone }}</li>
  <li><strong>Email:</strong> {{ $json.email }}</li>
</ul>

<h3>Question:</h3>
<p>{{ $json.question }}</p>

<p><em>Please follow up with this guest promptly.</em></p>
```

**Test**:
```bash
curl -X POST http://localhost:5678/webhook/contact/submit \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "test-123",
    "name": "John Doe",
    "phone": "555-1234",
    "email": "john@example.com",
    "question": "What are your check-in times?"
  }'
```

---

### 4. Statistics Update Workflow (Optional Enhancement)

**Purpose**: Real-time statistics updates to frontend via WebSocket

**Trigger**: Webhook
- Method: POST
- Path: `/webhook/stats/update`

**Nodes**:
1. **Webhook** (Trigger)
2. **HTTP Request** - Fetch Latest Stats
   - Method: GET
   - URL: `http://localhost:5000/api/admin/stats`

3. **WebSocket** - Broadcast to Clients
   - Send stats to connected admin dashboards

---

## Frontend Integration

### Option 1: Direct Backend (Current Implementation)
Frontend calls backend directly at `http://localhost:5000/api/*`

**Pros**: Simpler, fewer points of failure  
**Cons**: No n8n workflow orchestration

### Option 2: n8n Proxy (Full n8n Integration)
Frontend calls n8n webhooks, n8n calls backend

**Update frontend API service** (`src/services/api.js`):
```javascript
const BASE_URL = 'http://localhost:5678/webhook';

export const sendMessage = (sessionId, message, onChunk, onDone, onError) => {
  const url = `${BASE_URL}/chat/message`;
  // ... rest of code
};

export const uploadDocument = async (file, onProgress) => {
  const formData = new FormData();
  formData.append('file', file);
  return axios.post(`${BASE_URL}/document/upload`, formData, {
    // ... rest of code
  });
};

export const submitContactForm = async (sessionId, formData) => {
  return axios.post(`${BASE_URL}/contact/submit`, {
    sessionId,
    ...formData
  });
};
```

**Pros**: Full n8n orchestration, easier to add workflow logic  
**Cons**: Additional latency, n8n must always be running

---

## Advanced n8n Features

### Error Handling
Add error handling nodes:
```javascript
// Code Node: Error Handler
if ($input.first().json.error) {
  return [{
    json: {
      success: false,
      error: 'Failed to process request',
      details: $input.first().json.error
    }
  }];
}
```

### Logging
Add logging nodes to track all requests:
- Store to database
- Log to file
- Send to monitoring service

### Retry Logic
Configure HTTP Request nodes:
- Retry on Fail: true
- Max Retries: 3
- Wait Between Tries: 1000ms

### Data Transformation
Use Code nodes to transform data:
```javascript
// Extract and format data
const messages = $input.first().json.messages;
const formatted = messages.map(msg => ({
  role: msg.role,
  content: msg.content.substring(0, 100) + '...',
  timestamp: new Date(msg.timestamp).toLocaleString()
}));

return [{ json: { messages: formatted } }];
```

---

## Workflow Export/Import

### Export Workflows
1. Open workflow in n8n
2. Click "..." menu
3. Select "Export workflow"
4. Save as JSON file

### Import Workflows
1. In n8n, click "+" to create new workflow
2. Click "..." menu
3. Select "Import from file"
4. Choose exported JSON file

---

## Production Deployment

### n8n Cloud
1. Sign up at https://n8n.io/cloud/
2. Import workflows
3. Update webhook URLs in frontend
4. Set environment variables

### Self-Hosted with Docker
```bash
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n
```

### Environment Variables
```bash
export N8N_HOST=0.0.0.0
export N8N_PORT=5678
export N8N_PROTOCOL=https
export N8N_BASIC_AUTH_ACTIVE=true
export N8N_BASIC_AUTH_USER=admin
export N8N_BASIC_AUTH_PASSWORD=your_password
export WEBHOOK_URL=https://your-domain.com
```

---

## Monitoring & Debugging

### View Execution Logs
1. Open workflow
2. Click "Executions" tab
3. Click on any execution to see details

### Test Individual Nodes
1. Click on a node
2. Click "Execute Node"
3. View input/output data

### Webhook Testing
Use n8n's built-in test webhook URLs:
- Production: `https://your-n8n.com/webhook/path`
- Test: `https://your-n8n.com/webhook-test/path`

---

## Troubleshooting

### Webhook Not Responding
- Check n8n is running: `http://localhost:5678`
- Verify workflow is activated (toggle in top-right)
- Check webhook path is correct
- View execution logs for errors

### CORS Issues
Add headers in HTTP Request nodes:
```json
{
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
}
```

### Backend Connection Failed
- Verify backend is running: `http://localhost:5000/health`
- Check network connectivity
- Ensure URLs use correct protocol (http/https)

---

## Screenshots & Demo

When submitting:
1. Take screenshots of all three workflows in n8n
2. Show successful test executions
3. Demonstrate webhook URLs
4. Export workflows as JSON files

Include in submission:
- `chat-message-workflow.json`
- `document-upload-workflow.json`
- `contact-form-workflow.json`
- Screenshots folder with all workflow views

---

## Support

For n8n documentation: https://docs.n8n.io/
For n8n community: https://community.n8n.io/
