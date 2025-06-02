#!/usr/bin/env node

/**
 * Capacity Update Utility for JCU Fitness Center
 * This script updates all existing sessions to have 10-person capacity
 */

const Database = require('better-sqlite3')
const path = require('path')

const DB_PATH = path.join('./data/jcu-gym.db')

function updateCapacity() {
  console.log('🔧 JCU Fitness Center - Capacity Update Utility')
  console.log('================================================')
  
  try {
    // Check if database exists
    const db = new Database(DB_PATH)
    
    // Update all sessions to have 10 capacity
    const updateStmt = db.prepare(`
      UPDATE gym_sessions 
      SET capacity = 10 
      WHERE capacity != 10
    `)
    
    const result = updateStmt.run()
    
    console.log(`✅ Updated ${result.changes} sessions to 10-person capacity`)
    
    // Get summary of sessions
    const summaryStmt = db.prepare(`
      SELECT 
        COUNT(*) as total_sessions,
        SUM(CASE WHEN current_bookings >= capacity THEN 1 ELSE 0 END) as full_sessions,
        SUM(CASE WHEN current_bookings < capacity THEN 1 ELSE 0 END) as available_sessions
      FROM gym_sessions 
      WHERE is_active = 1
    `)
    
    const summary = summaryStmt.get()
    
    console.log('')
    console.log('📊 Session Summary:')
    console.log(`   Total Sessions: ${summary.total_sessions}`)
    console.log(`   Available Sessions: ${summary.available_sessions}`)
    console.log(`   Full Sessions: ${summary.full_sessions}`)
    console.log('')
    console.log('✅ All sessions now have 10-person capacity limit')
    
    db.close()
    
  } catch (error) {
    if (error.code === 'SQLITE_CANTOPEN') {
      console.log('ℹ️  Database not found - will be created with correct capacity when app starts')
    } else {
      console.error('❌ Error updating capacity:', error.message)
    }
  }
  
  console.log('================================================')
}

// Run the update function
updateCapacity() 