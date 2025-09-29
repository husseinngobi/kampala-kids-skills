#!/usr/bin/env node

import { spawn } from 'child_process';
import { existsSync } from 'fs';
import { mkdir } from 'fs/promises';
import path from 'path';

const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function runCommand(command, args = []) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: 'inherit', shell: true });
    child.on('close', (code) => {
      if (code === 0) {
        resolve(code);
      } else {
        reject(new Error(`Command failed with code ${code}`));
      }
    });
  });
}

async function createDirectories() {
  const dirs = [
    'uploads',
    'uploads/videos',
    'uploads/videos/thumbnails'
  ];

  for (const dir of dirs) {
    if (!existsSync(dir)) {
      await mkdir(dir, { recursive: true });
      log(`✅ Created directory: ${dir}`, 'green');
    } else {
      log(`📁 Directory exists: ${dir}`, 'yellow');
    }
  }
}

async function setup() {
  try {
    log('🚀 Setting up Kampala Kids Skills Backend...', 'blue');
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'blue');

    // Check if node_modules exists
    if (!existsSync('node_modules')) {
      log('📦 Installing dependencies...', 'yellow');
      await runCommand('npm', ['install']);
      log('✅ Dependencies installed', 'green');
    } else {
      log('📦 Dependencies already installed', 'yellow');
    }

    // Create upload directories
    log('📁 Creating upload directories...', 'yellow');
    await createDirectories();

    // Generate Prisma client
    log('🔧 Generating Prisma client...', 'yellow');
    await runCommand('npm', ['run', 'db:generate']);
    log('✅ Prisma client generated', 'green');

    // Push database schema
    log('📊 Setting up database...', 'yellow');
    await runCommand('npm', ['run', 'db:push']);
    log('✅ Database schema applied', 'green');

    // Seed database
    log('🌱 Seeding database with initial data...', 'yellow');
    await runCommand('npm', ['run', 'db:seed']);
    log('✅ Database seeded successfully', 'green');

    // Success message
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'green');
    log('🎉 Backend setup completed successfully!', 'green');
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'green');
    log('');
    log('📧 Admin Login Details:', 'blue');
    log('   Email: admin@kampala-kids-skills.com', 'blue');
    log('   Password: admin123', 'blue');
    log('');
    log('🔗 Next Steps:', 'blue');
    log('   1. Start the server: npm run dev', 'blue');
    log('   2. API will be available at: http://localhost:5000', 'blue');
    log('   3. Admin Dashboard: http://localhost:5000/admin', 'blue');
    log('   4. Database Studio: npm run db:studio', 'blue');
    log('');
    log('🎯 Ready for frontend integration!', 'green');

  } catch (error) {
    log('❌ Setup failed:', 'red');
    log(error.message, 'red');
    process.exit(1);
  }
}

setup();