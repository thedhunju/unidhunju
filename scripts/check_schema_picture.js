const db = require('../db');

async function checkSchema() {
    try {
        console.log('Checking users table schema...');

        const [columns] = await db.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'unifind' AND TABLE_NAME = 'users';
    `);

        const columnNames = columns.map(c => c.COLUMN_NAME);
        console.log('Columns in users table:', columnNames);

        if (columnNames.includes('picture')) {
            console.log('SUCCESS: "picture" column exists.');
        } else {
            console.log('FAILURE: "picture" column is MISSING.');
        }

        process.exit(0);
    } catch (err) {
        console.error('Error checking schema:', err);
        process.exit(1);
    }
}

checkSchema();
