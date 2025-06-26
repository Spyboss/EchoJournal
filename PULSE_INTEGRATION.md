# Pulse Agent Integration Guide

## Overview
This document provides comprehensive instructions for integrating the Pulse AI agent with the Echo Journal application.

## Current Status
✅ **FIXED ISSUES:**
- Firebase initialization imports
- API route configuration (removed force-static)
- Created dedicated Pulse API endpoints
- Firestore security rules configured
- Environment variables properly set

## API Endpoints for Pulse Agent

### Base URL
- **Production:** `https://studio--echo-journal-hnzep.us-central1.hosted.app/api/pulse`
- **Development:** `http://localhost:9002/api/pulse`

### 1. Create Journal Entry
**POST** `/api/pulse`

```json
{
  "userId": "user-firebase-uid",
  "entryText": "Today I felt really productive...",
  "agentId": "pulse-agent"
}
```

**Response:**
```json
{
  "message": "Journal entry added successfully",
  "entryId": "doc-id",
  "sentiment": {
    "sentiment": "positive",
    "summary": "The user expressed feelings of productivity and accomplishment."
  }
}
```

### 2. Get Journal Entries
**GET** `/api/pulse?userId=USER_ID&agentId=pulse-agent&limit=10`

**Response:**
```json
{
  "entries": [
    {
      "id": "entry-id",
      "userId": "user-id",
      "entryText": "Journal content...",
      "timestamp": "2024-01-15T10:30:00Z",
      "sentimentSummary": "Positive mood detected"
    }
  ],
  "total": 25
}
```

### 3. Update Entry with Analysis
**PUT** `/api/pulse`

```json
{
  "entryId": "doc-id",
  "sentimentSummary": "Updated analysis",
  "agentId": "pulse-agent"
}
```

## Deployment Instructions

### Method 1: Firebase App Hosting (Recommended)
```bash
# 1. Build the application
npm run build

# 2. Deploy to Firebase
firebase deploy
```

### Method 2: Manual GitHub Sync
```bash
# 1. Commit changes to GitHub
git add .
git commit -m "Fix Firebase integration and add Pulse API"
git push origin main

# 2. In Firebase Console:
# - Go to App Hosting
# - Click "Deploy" on your connected repository
# - Wait for build to complete
```

## Environment Setup

### Required Environment Variables
```env
# Google AI (for sentiment analysis)
GOOGLE_GENAI_API_KEY=your-google-ai-key

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=echo-journal-hnzep.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=echo-journal-hnzep
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=echo-journal-hnzep.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1043477246116
NEXT_PUBLIC_FIREBASE_APP_ID=1:1043477246116:web:5cbe19365e957682c07631
```

## Security Features

### Firestore Rules
- Users can only access their own journal entries
- Authentication required for all operations
- Agent ID validation for Pulse endpoints

### API Security
- Agent ID validation (`pulse-agent` required)
- User ID validation
- Error handling and logging

## Testing the Integration

### 1. Test Authentication
```bash
curl -X POST https://studio--echo-journal-hnzep.us-central1.hosted.app/api/pulse \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-id",
    "entryText": "Test entry from Pulse agent",
    "agentId": "pulse-agent"
  }'
```

### 2. Test Data Retrieval
```bash
curl "https://studio--echo-journal-hnzep.us-central1.hosted.app/api/pulse?userId=test-user-id&agentId=pulse-agent&limit=5"
```

## Pulse Agent Implementation Example

```python
import requests
import json

class EchoJournalClient:
    def __init__(self, base_url, agent_id="pulse-agent"):
        self.base_url = base_url
        self.agent_id = agent_id
    
    def create_entry(self, user_id, entry_text):
        """Create a new journal entry"""
        response = requests.post(
            f"{self.base_url}/api/pulse",
            json={
                "userId": user_id,
                "entryText": entry_text,
                "agentId": self.agent_id
            }
        )
        return response.json()
    
    def get_entries(self, user_id, limit=10):
        """Get user's journal entries"""
        response = requests.get(
            f"{self.base_url}/api/pulse",
            params={
                "userId": user_id,
                "agentId": self.agent_id,
                "limit": limit
            }
        )
        return response.json()

# Usage
client = EchoJournalClient("https://studio--echo-journal-hnzep.us-central1.hosted.app")
result = client.create_entry("user123", "Today I accomplished my goals!")
print(result)
```

## Troubleshooting

### Common Issues
1. **Firebase Auth Errors**: Ensure user is authenticated before API calls
2. **CORS Issues**: API routes handle CORS automatically
3. **Build Failures**: Check that all dependencies are installed
4. **Sentiment Analysis Fails**: Verify GOOGLE_GENAI_API_KEY is set

### Logs and Monitoring
- Check Firebase Console > Functions > Logs
- Monitor API usage in Firebase Analytics
- Use browser dev tools for client-side debugging

## Next Steps
1. Deploy the fixed application
2. Test Pulse agent integration
3. Monitor performance and usage
4. Add additional features as needed

## Support
For issues or questions, check:
- Firebase Console logs
- GitHub repository issues
- Application error logs in browser console