const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function testSessionFlow() {
  const backendUrl = 'http://localhost:5000';

  // Create a dummy file
  const testFilePath = path.join(__dirname, 'test_file.js');
  fs.writeFileSync(testFilePath, 'console.log("hello world");');

  const form = new FormData();
  form.append('files', fs.createReadStream(testFilePath));

  try {
    console.log('1. Testing /api/analyze-direct...');
    const analyzeRes = await axios.post(`${backendUrl}/api/analyze-direct`, form, {
      headers: form.getHeaders()
    });

    const data = analyzeRes.data;
    console.log('Analysis Result:', JSON.stringify(data, null, 2));

    if (data.success && data.sessionId) {
      console.log(`2. Testing /api/download-fix/${data.sessionId}...`);
      const downloadRes = await axios.get(`${backendUrl}/api/download-fix/${data.sessionId}`, {
        responseType: 'arraybuffer'
      });

      console.log('Download Status:', downloadRes.status);
      console.log('Content-Type:', downloadRes.headers['content-type']);
      console.log('ZIP Length:', downloadRes.data.length);

      if (downloadRes.status === 200 && downloadRes.headers['content-type'] === 'application/zip') {
        console.log('✅ Session-based download flow verified.');
      } else {
        console.error('❌ Download failed or incorrect type.');
      }
    } else {
      console.error('❌ Analysis failed or no sessionId returned.');
    }
  } catch (error) {
    console.error('Test Failed:', error.response?.data || error.message);
  } finally {
    if (fs.existsSync(testFilePath)) fs.unlinkSync(testFilePath);
  }
}

testSessionFlow();
