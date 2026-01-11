const db = require('../db');

async function updateSchema() {
    try {
        console.log('Checking users table for OTP columns...');

        // Check if columns exist
        const [columns] = await db.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'unifind' AND TABLE_NAME = 'users' AND COLUMN_NAME IN ('reset_otp', 'reset_otp_expires');
    `);

        const existingColumns = columns.map(c => c.COLUMN_NAME);

        if (!existingColumns.includes('reset_otp')) {
            console.log('Adding reset_otp column...');
            await db.execute('ALTER TABLE users ADD COLUMN reset_otp VARCHAR(6) NULL');
        }

        if (!existingColumns.includes('reset_otp_expires')) {
            console.log('Adding reset_otp_expires column...');
            await db.execute('ALTER TABLE users ADD COLUMN reset_otp_expires DATETIME NULL');
        }

        console.log('Database schema update complete.');
        process.exit(0);
    } catch (err) {
        console.error('Error updating schema:', err);
        process.exit(1);
    }
}

updateSchema();
