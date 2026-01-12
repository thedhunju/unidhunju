const db = require('../db');

async function migrate() {
  console.log('🔄 Starting database migration...');
  
  try {
    const [columns] = await db.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'items'
    `);
    
    const existingColumns = columns.map(c => c.COLUMN_NAME);
    console.log('📋 Existing columns:', existingColumns.join(', '));
    
    // ✅ Fixed: Wrapped 'condition' in backticks
    if (!existingColumns.includes('condition')) {
      await db.execute('ALTER TABLE items ADD COLUMN `condition` VARCHAR(50) AFTER category');
      console.log('✅ Added column: condition');
    } else {
      console.log('⚠️  Column "condition" already exists');
    }
    
    if (!existingColumns.includes('seller_phone')) {
      await db.execute('ALTER TABLE items ADD COLUMN seller_phone VARCHAR(20) AFTER `condition`');
      console.log('✅ Added column: seller_phone');
    } else {
      console.log('⚠️  Column "seller_phone" already exists');
    }
    
    if (!existingColumns.includes('seller_social_platform')) {
      await db.execute('ALTER TABLE items ADD COLUMN seller_social_platform VARCHAR(50) AFTER seller_phone');
      console.log('✅ Added column: seller_social_platform');
    } else {
      console.log('⚠️  Column "seller_social_platform" already exists');
    }
    
    if (!existingColumns.includes('seller_social_handle')) {
      await db.execute('ALTER TABLE items ADD COLUMN seller_social_handle VARCHAR(100) AFTER seller_social_platform');
      console.log('✅ Added column: seller_social_handle');
    } else {
      console.log('⚠️  Column "seller_social_handle" already exists');
    }

    console.log('✅ Migration completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    console.error('Full error:', err);
    process.exit(1);
  }
}

migrate();