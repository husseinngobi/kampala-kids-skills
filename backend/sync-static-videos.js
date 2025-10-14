#!/usr/bin/env node

/**
 * CLI tool to sync featured videos to frontend static folder
 * Usage: node sync-static-videos.js [command]
 */

import StaticVideoManager from './src/utils/staticVideoManager.js';

async function main() {
  const command = process.argv[2] || 'sync';
  const manager = new StaticVideoManager();

  try {
    await manager.init();

    switch (command) {
      case 'sync':
        console.log('🔄 Starting video sync...');
        const result = await manager.syncFeaturedVideos();
        console.log('📊 Sync Results:');
        console.log(`   Total: ${result.total}`);
        console.log(`   Synced: ${result.synced}`);
        console.log(`   Failed: ${result.failed}`);
        break;

      case 'status':
        console.log('📊 Checking sync status...');
        const status = await manager.getSyncStatus();
        console.log('Sync Status:');
        console.log(`   In Sync: ${status.inSync ? '✅' : '❌'}`);
        console.log(`   DB Featured Videos: ${status.dbFeaturedCount}`);
        console.log(`   Static Files: ${status.staticFilesCount}`);
        console.log(`   Manifest Exists: ${status.manifestExists ? '✅' : '❌'}`);
        console.log(`   Last Synced: ${status.lastSyncedAt || 'Never'}`);
        console.log(`   Needs Sync: ${status.needsSync ? '⚠️  Yes' : '✅ No'}`);
        break;

      case 'cleanup':
        console.log('🧹 Cleaning up static folder...');
        const removedCount = await manager.cleanupStaticFolder();
        console.log(`✅ Cleanup completed: ${removedCount} files removed`);
        break;

      case 'help':
      default:
        console.log('📖 Static Video Sync Tool');
        console.log('');
        console.log('Commands:');
        console.log('  sync     - Sync featured videos to frontend (default)');
        console.log('  status   - Check sync status');
        console.log('  cleanup  - Remove unfeatured videos from static folder');
        console.log('  help     - Show this help');
        console.log('');
        console.log('Examples:');
        console.log('  node sync-static-videos.js sync');
        console.log('  node sync-static-videos.js status');
        console.log('  node sync-static-videos.js cleanup');
        break;
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Check if this file is being run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { main };