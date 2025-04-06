#!/usr/bin/env node

/**
 * EduFlow Connectivity Diagnostic Tool
 * 
 * This script helps diagnose connection issues between:
 * 1. Client and Server
 * 2. Server and MongoDB
 * 3. Server and Firebase
 */

const http = require('http');
const https = require('https');
const { exec } = require('child_process');
const readline = require('readline');
const fs = require('fs');
const path = require('path');
const os = require('os');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Color codes for terminal output
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m"
};

console.log(`${colors.cyan}
╔════════════════════════════════════════════════╗
║               EduFlow Diagnostics              ║
║           Connection Troubleshooting           ║
╚════════════════════════════════════════════════╝
${colors.reset}`);

// Check for environment files
function checkEnvironmentFiles() {
  console.log(`${colors.magenta}CHECKING ENVIRONMENT FILES${colors.reset}`);
  
  const files = [
    { path: path.join(process.cwd(), 'server', '.env'), name: 'server/.env' },
    { path: path.join(process.cwd(), 'client', '.env.development'), name: 'client/.env.development' },
    { path: path.join(process.cwd(), 'client', '.env.production'), name: 'client/.env.production' }
  ];
  
  files.forEach(file => {
    if (fs.existsSync(file.path)) {
      console.log(`${colors.green}✓ ${file.name} exists${colors.reset}`);
      
      // Check for key environment variables
      const content = fs.readFileSync(file.path, 'utf8');
      
      if (file.name === 'server/.env') {
        if (!content.includes('MONGODB_URI=')) {
          console.log(`${colors.red}✗ MONGODB_URI not found in ${file.name}${colors.reset}`);
        }
        if (!content.includes('JWT_SECRET=')) {
          console.log(`${colors.red}✗ JWT_SECRET not found in ${file.name}${colors.reset}`);
        }
      } else if (file.name === 'client/.env.development') {
        if (!content.includes('VITE_API_URL=')) {
          console.log(`${colors.red}✗ VITE_API_URL not found in ${file.name}${colors.reset}`);
        }
      }
    } else {
      console.log(`${colors.red}✗ ${file.name} does not exist${colors.reset}`);
    }
  });
  
  console.log();
}

// Check if server is running
function checkServerStatus() {
  console.log(`${colors.magenta}CHECKING SERVER STATUS${colors.reset}`);
  
  // Check localhost:5000
  const req = http.request({
    hostname: 'localhost',
    port: 5000,
    path: '/api',
    method: 'GET',
    timeout: 3000
  }, (res) => {
    console.log(`${colors.green}✓ Server is running on localhost:5000 (Status: ${res.statusCode})${colors.reset}`);
    checkClientStatus();
  });
  
  req.on('error', (error) => {
    console.log(`${colors.red}✗ Server is not running on localhost:5000${colors.reset}`);
    console.log(`${colors.yellow}Error: ${error.message}${colors.reset}`);
    console.log(`${colors.yellow}Try starting the server with: npm run server${colors.reset}`);
    checkClientStatus();
  });
  
  req.on('timeout', () => {
    req.destroy();
    console.log(`${colors.red}✗ Server connection timed out${colors.reset}`);
    checkClientStatus();
  });
  
  req.end();
}

// Check if client development server is running
function checkClientStatus() {
  console.log(`${colors.magenta}CHECKING CLIENT STATUS${colors.reset}`);
  
  // Check localhost:5173 (Vite dev server)
  const req = http.request({
    hostname: 'localhost',
    port: 5173,
    path: '/',
    method: 'GET',
    timeout: 3000
  }, (res) => {
    console.log(`${colors.green}✓ Client development server is running on localhost:5173 (Status: ${res.statusCode})${colors.reset}`);
    checkMongoDB();
  });
  
  req.on('error', (error) => {
    console.log(`${colors.red}✗ Client development server is not running on localhost:5173${colors.reset}`);
    console.log(`${colors.yellow}Error: ${error.message}${colors.reset}`);
    console.log(`${colors.yellow}Try starting the client with: npm run client${colors.reset}`);
    checkMongoDB();
  });
  
  req.on('timeout', () => {
    req.destroy();
    console.log(`${colors.red}✗ Client connection timed out${colors.reset}`);
    checkMongoDB();
  });
  
  req.end();
}

// Check MongoDB connection
function checkMongoDB() {
  console.log(`${colors.magenta}CHECKING MONGODB CONNECTION${colors.reset}`);
  
  const serverEnvPath = path.join(process.cwd(), 'server', '.env');
  
  if (!fs.existsSync(serverEnvPath)) {
    console.log(`${colors.red}✗ Cannot check MongoDB - server/.env file not found${colors.reset}`);
    provideSummary();
    return;
  }
  
  // Read MONGODB_URI from .env file
  const envContent = fs.readFileSync(serverEnvPath, 'utf8');
  const match = envContent.match(/MONGODB_URI=(.+)/);
  
  if (!match) {
    console.log(`${colors.red}✗ MONGODB_URI not found in server/.env${colors.reset}`);
    provideSummary();
    return;
  }
  
  const mongoUri = match[1].trim();
  
  if (mongoUri.startsWith('mongodb://localhost') || mongoUri.startsWith('mongodb://127.0.0.1')) {
    console.log(`${colors.yellow}! Local MongoDB detected (${mongoUri})${colors.reset}`);
    console.log(`${colors.yellow}  Make sure MongoDB is installed and running on your machine${colors.reset}`);
    provideSummary();
  } else if (mongoUri.includes('mongodb.net') || mongoUri.includes('atlas')) {
    console.log(`${colors.blue}i MongoDB Atlas detected${colors.reset}`);
    
    // Extract host from MongoDB URI to ping
    const hostMatch = mongoUri.match(/@([^/:]+)/);
    if (hostMatch && hostMatch[1]) {
      const host = hostMatch[1];
      console.log(`${colors.blue}i Checking connectivity to MongoDB host: ${host}${colors.reset}`);
      
      // Ping MongoDB host
      exec(`ping -c 1 ${host}`, (error, stdout, stderr) => {
        if (error) {
          console.log(`${colors.red}✗ Cannot reach MongoDB host${colors.reset}`);
          console.log(`${colors.yellow}  This could be due to network issues or firewall restrictions${colors.reset}`);
        } else {
          console.log(`${colors.green}✓ MongoDB host is reachable${colors.reset}`);
          console.log(`${colors.yellow}  Note: This only confirms the host is reachable, not that credentials are correct${colors.reset}`);
        }
        provideSummary();
      });
    } else {
      console.log(`${colors.red}✗ Could not extract MongoDB host from connection string${colors.reset}`);
      provideSummary();
    }
  } else {
    console.log(`${colors.yellow}! Unrecognized MongoDB URI format${colors.reset}`);
    provideSummary();
  }
}

// Provide a summary of findings and suggestions
function provideSummary() {
  console.log('\n' + '='.repeat(50) + '\n');
  console.log(`${colors.cyan}DIAGNOSTIC SUMMARY${colors.reset}`);
  console.log(`${colors.cyan}=================\n${colors.reset}`);
  
  console.log(`${colors.blue}If you're seeing connection errors:${colors.reset}`);
  console.log(`1. Ensure both server and client are running`);
  console.log(`   - Server: npm run server (should be on port 5000)`);
  console.log(`   - Client: npm run client (should be on port 5173)\n`);
  
  console.log(`2. Check your environment files:`);
  console.log(`   - server/.env should have MONGODB_URI and JWT_SECRET`);
  console.log(`   - client/.env.development should have VITE_API_URL=http://localhost:5000/api\n`);
  
  console.log(`3. Verify MongoDB connection:`);
  console.log(`   - For local MongoDB: Make sure MongoDB service is running`);
  console.log(`   - For MongoDB Atlas: Check your network connection and whitelist your IP\n`);
  
  console.log(`4. Common issues:`);
  console.log(`   - CORS errors: Check that server is properly configured for CORS`);
  console.log(`   - ERR_CONNECTION_REFUSED: Server is not running or on a different port`);
  console.log(`   - Authentication errors: Check JWT_SECRET and token handling\n`);
  
  console.log(`${colors.green}For production deployment issues:${colors.reset}`);
  console.log(`1. Ensure all environment variables are set in Render dashboard`);
  console.log(`2. Check that your build process is properly configured`);
  console.log(`3. Review Render logs for any build or runtime errors\n`);
  
  console.log(`${colors.yellow}Want to test API endpoints directly? Try:${colors.reset}`);
  console.log(`curl http://localhost:5000/api\n`);
  
  process.exit(0);
}

// Run checks
checkEnvironmentFiles();
checkServerStatus(); 