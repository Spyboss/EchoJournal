const https = require('https');

// Test POST request to add a journal entry
const postData = JSON.stringify({
  userId: 'test-user-123',
  entryText: 'This is a test journal entry from API test'
});

const postOptions = {
  hostname: 'studio--echo-journal-hnzep.us-central1.hosted.app',
  port: 443,
  path: '/api/entries/',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

console.log('Testing POST /api/entries/...');
const postReq = https.request(postOptions, (res) => {
  console.log(`POST Status: ${res.statusCode}`);
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log('POST Response:', data);
    
    // After POST, test GET request
    setTimeout(() => {
      console.log('\nTesting GET /api/entries/...');
      const getOptions = {
        hostname: 'studio--echo-journal-hnzep.us-central1.hosted.app',
        port: 443,
        path: '/api/entries/?userId=test-user-123',
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      };
      
      const getReq = https.request(getOptions, (res) => {
        console.log(`GET Status: ${res.statusCode}`);
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          console.log('GET Response:', data);
        });
      });
      
      getReq.on('error', (error) => {
        console.error('GET Error:', error);
      });
      
      getReq.end();
    }, 1000);
  });
});

postReq.on('error', (error) => {
  console.error('POST Error:', error);
});

postReq.write(postData);
postReq.end();