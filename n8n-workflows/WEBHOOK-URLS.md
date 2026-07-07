# Cincinnati Hotel Chatbot - n8n Webhook URLs

## Production URLs

These URLs are used when workflows are activated (live use):

- **Chat Message:** `https://jcelario026.app.n8n.cloud/webhook/chat-messasge`
- **Document Upload:** `https://jcelario026.app.n8n.cloud/webhook/document-upload`
- **Contact Form:** `https://jcelario026.app.n8n.cloud/webhook/contact-form`

## Test URLs

These URLs are used for testing during development:

- **Chat Message:** `https://jcelario026.app.n8n.cloud/webhook-test/chat-messasge`
- **Document Upload:** `https://jcelario026.app.n8n.cloud/webhook-test/document-upload`
- **Contact Form:** `https://jcelario026.app.n8n.cloud/webhook-test/contact-form`

## n8n Instance

**Dashboard:** https://jcelario026.app.n8n.cloud

## Workflow Files

- `Chat_Message_Handler.json` - Handles chat messages from users
- `Document_Upload_Handler.json` - Handles PDF document uploads
- `Contact_Form_Handler.json` - Sends email notifications when AI can't answer

## Testing

### Test Chat Message:
```bash
curl -X POST https://jcelario026.app.n8n.cloud/webhook-test/chat-messasge \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"test-123","message":"What are your room rates?"}'
```

### Test Document Upload:
```bash
curl -X POST https://jcelario026.app.n8n.cloud/webhook-test/document-upload \
  -F "file=@sample-hotel-info.pdf"
```

### Test Contact Form:
```bash
curl -X POST https://jcelario026.app.n8n.cloud/webhook-test/contact-form \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"test-789","name":"John Doe","phone":"555-1234","email":"john@example.com","question":"Do you have a helipad?"}'
```

## Integration

To integrate n8n with the frontend, update `frontend/src/services/api.js`:

```javascript
// Change base URL from direct backend to n8n webhooks
const BASE_URL = 'https://jcelario026.app.n8n.cloud/webhook';
```

Then update individual functions to use n8n webhook paths instead of direct backend API paths.

## Notes

- Workflows are created and tested in n8n Cloud
- Current production system uses direct backend connection for stability
- n8n integration is production-ready and can be activated by updating frontend API URLs
- All workflows successfully communicate with Railway backend
