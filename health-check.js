#!/usr/bin/env node

// Health Check Script for Kampala Kids Skills Programme
// Run with: node health-check.js

const fetch = require('node-fetch');
const fs = require('fs').promises;
const path = require('path');

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:8080';

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function checkEndpoint(url, name) {
  try {
    const response = await fetch(url, { timeout: 5000 });
    if (response.ok) {
      log(`✅ ${name}: OK (${response.status})`, 'green');
      return true;
    } else {
      log(`❌ ${name}: Failed (${response.status})`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ ${name}: Error - ${error.message}`, 'red');
    return false;
  }
}

async function checkFile(filePath, name) {
  try {
    await fs.access(filePath);
    log(`✅ ${name}: Exists`, 'green');
    return true;
  } catch (error) {
    log(`❌ ${name}: Missing`, 'red');
    return false;
  }
}

async function main() {
  log('🏥 Kampala Kids Skills Programme - Health Check', 'blue');
  log('='.repeat(50), 'blue');

  const checks = [];

  // Backend health checks
  log('\n📡 Backend Services:', 'yellow');
  checks.push(await checkEndpoint(`${BACKEND_URL}/health`, 'Backend Health'));
  checks.push(await checkEndpoint(`${BACKEND_URL}/api/gallery/media?limit=1`, 'Gallery API'));
  checks.push(await checkEndpoint(`${BACKEND_URL}/uploads/videos/house-cleaning.mp4`, 'Video Serving'));

  // File system checks
  log('\n📁 File System:', 'yellow');
  checks.push(await checkFile('./backend/src/index.js', 'Backend Entry Point'));
  checks.push(await checkFile('./frontend/dist/index.html', 'Frontend Build'));
  checks.push(await checkFile('./backend/uploads/videos', 'Video Directory'));
  checks.push(await checkFile('./backend/uploads/images', 'Image Directory'));

  // Database checks
  log('\n🗄️ Database:', 'yellow');
  checks.push(await checkFile('./backend/dev.db', 'SQLite Database'));
  checks.push(await checkFile('./backend/prisma/schema.prisma', 'Prisma Schema'));

  // Frontend checks (if accessible)
  log('\n🌐 Frontend:', 'yellow');
  checks.push(await checkEndpoint(FRONTEND_URL, 'Frontend Server'));

  // Summary
  const passed = checks.filter(Boolean).length;
  const total = checks.length;
  
  log('\n' + '='.repeat(50), 'blue');
  if (passed === total) {
    log(`🎉 All checks passed! (${passed}/${total})`, 'green');
    process.exit(0);
  } else {
    log(`⚠️ Some checks failed. (${passed}/${total})`, 'yellow');
    process.exit(1);
  }
}

main().catch((error) => {
  log(`💥 Health check failed: ${error.message}`, 'red');
  process.exit(1);
});