#!/usr/bin/env node

/**
 * Database Reset Utility for JCU Fitness Center
 * This script helps reset the database for testing purposes
 */

const fs = require('fs')
const path = require('path')

const DB_PATH = './jcu-fitness.db'

function resetDatabase() {
  console.log('🗑️  JCU Fitness Center - Database Reset Utility')
  console.log('================================================')
  
  if (fs.existsSync(DB_PATH)) {
    try {
      fs.unlinkSync(DB_PATH)
      console.log('✅ Database file deleted successfully')
      console.log('💡 The database will be recreated when you start the application')
      console.log('')
      console.log('🚀 You can now run: ./start.sh (or start.bat on Windows)')
    } catch (error) {
      console.error('❌ Error deleting database file:', error.message)
      console.log('')
      console.log('💡 Manual steps:')
      console.log('   1. Stop the application (Ctrl+C)')
      console.log('   2. Delete the jcu-fitness.db file manually')
      console.log('   3. Restart the application')
    }
  } else {
    console.log('ℹ️  Database file not found - nothing to reset')
    console.log('💡 The database will be created when you start the application')
  }
  
  console.log('================================================')
}

// Run the reset function
resetDatabase() 