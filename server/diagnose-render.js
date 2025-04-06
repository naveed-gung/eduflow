/**
 * Render Diagnostic Script
 * 
 * Run this script using: node diagnose-render.js
 */

const fs = require('fs');
const path = require('path');
const http = require('http');

console.log('🔍 EduFlow Render Diagnostic Tool');
console.log('================================\n');

// Check environment
console.log('Environment Variables:');
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('- RENDER:', process.env.RENDER);
console.log('- PORT:', process.env.PORT);
console.log('- CLIENT_URL:', process.env.CLIENT_URL);
console.log('- MONGODB_URI:', process.env.MONGODB_URI ? 'Set (hidden for security)' : 'Not set');
console.log('- JWT_SECRET:', process.env.JWT_SECRET ? 'Set (hidden for security)' : 'Not set');
console.log('- FIREBASE_PROJECT_ID:', process.env.FIREBASE_PROJECT_ID || 'Not set');

// Check file system and paths
console.log('\nFile System Check:');
const publicPath = path.join(__dirname, 'public');
console.log('- Public directory exists:', fs.existsSync(publicPath));

if (fs.existsSync(publicPath)) {
  const indexPath = path.join(publicPath, 'index.html');
  console.log('- index.html exists:', fs.existsSync(indexPath));
  
  try {
    const files = fs.readdirSync(publicPath);
    console.log('- Public directory contents:', files.length > 0 ? 'Has files' : 'Empty');
    console.log('  First 5 files:', files.slice(0, 5));
  } catch (err) {
    console.log('- Error reading public directory:', err.message);
  }
}

// Check the CORS configuration file
const indexFilePath = path.join(__dirname, 'src', 'index.js');
console.log('- Server index.js exists:', fs.existsSync(indexFilePath));

if (fs.existsSync(indexFilePath)) {
  try {
    const indexContent = fs.readFileSync(indexFilePath, 'utf8');
    console.log('- CORS Configuration:');
    
    if (indexContent.includes('origin: isProduction ? true')) {
      console.log('  ✅ CORS set to allow all origins in production');
    } else if (indexContent.includes('origin: true')) {
      console.log('  ✅ CORS set to allow all origins');
    } else if (indexContent.includes('origin: function')) {
      console.log('  ⚠️ CORS using function-based origin - might be restrictive');
    } else if (indexContent.includes('origin: [')) {
      console.log('  ⚠️ CORS using array of specific origins - might be restrictive');
    } else {
      console.log('  ❌ Could not identify CORS configuration');
    }
  } catch (err) {
    console.log('- Error reading index.js:', err.message);
  }
}

// Basic network check
console.log('\nNetwork Check:');
try {
  const hostname = process.env.CLIENT_URL || 'http://localhost';
  console.log('- Checking self-connection to API endpoint...');
  
  const req = http.get(`${hostname}/api`, (res) => {
    console.log(`  Status code: ${res.statusCode}`);
    res.on('data', (chunk) => {
      console.log(`  Response: ${chunk}`);
    });
  });
  
  req.on('error', (error) => {
    console.log(`  Connection error: ${error.message}`);
  });
  
  req.end();
} catch (err) {
  console.log('- Network check error:', err.message);
}

console.log('\n🔍 Diagnostic complete. Check the output above for potential issues.');
console.log('For more advanced debugging, check the Render logs in your dashboard.'); 