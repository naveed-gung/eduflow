/**
 * EduFlow Render CORS Fix Script
 * 
 * This script automatically applies the necessary CORS fixes for Render deployment
 * without requiring Git. It can be run on the server after deployment.
 * 
 * Usage: node render-fix.js
 */

const fs = require('fs');
const path = require('path');

console.log('🛠 EduFlow Render CORS Fix');
console.log('==========================\n');

// Define the server index.js path
const indexPath = path.join(__dirname, 'server', 'src', 'index.js');

// Check if the file exists
if (!fs.existsSync(indexPath)) {
  console.error('❌ Could not find the server index.js file!');
  console.error('Expected path:', indexPath);
  process.exit(1);
}

// Read the file
console.log('📂 Reading server/src/index.js...');
let indexContent = fs.readFileSync(indexPath, 'utf8');

// Check if the CORS section exists
if (!indexContent.includes('Configure CORS for deployment')) {
  console.error('❌ Could not find the CORS configuration section!');
  process.exit(1);
}

// Prepare the replacement CORS configuration
const simpleCorsConfig = `// Configure CORS for deployment
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(cors({
  // In production, allow all origins
  origin: true,
  credentials: true
}));`;

// Find and replace the CORS section
console.log('🔄 Updating CORS configuration...');
const corsRegex = /\/\/ Configure CORS for deployment[\s\S]*?credentials: true\s*\}\)\);/;
indexContent = indexContent.replace(corsRegex, simpleCorsConfig);

// Write the updated content back to the file
console.log('💾 Saving changes...');
fs.writeFileSync(indexPath, indexContent);

// Force production environment setting
console.log('🔧 Setting production environment...');
const envPath = path.join(__dirname, 'server', '.env');
let envContent = '';

if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, 'utf8');
}

// Update or add NODE_ENV and RENDER settings
if (!envContent.includes('NODE_ENV=production')) {
  envContent += '\nNODE_ENV=production';
}
if (!envContent.includes('RENDER=true')) {
  envContent += '\nRENDER=true';
}

fs.writeFileSync(envPath, envContent);

console.log('\n✅ CORS fix applied successfully!');
console.log('Restart your server for the changes to take effect.');
console.log('To restart on Render, you can use the "Manual Deploy" button in your dashboard.'); 