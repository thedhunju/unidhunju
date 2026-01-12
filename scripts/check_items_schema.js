const db = require('../db');

async function checkItemsSchema() {
    try {
        console.log('Checking items table schema...');

        const [columns] = await db.execute(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'unifind_db' AND TABLE_NAME = 'items';
    `);

        if (columns.length === 0) {
            console.log('FAILURE: items table does not exist in unifind_db.');
        } else {
            console.log('Columns in items table:');
            columns.forEach(c => {
                console.log(`- ${c.COLUMN_NAME}: ${c.DATA_TYPE} (Nullable: ${c.IS_NULLABLE}, Default: ${c.COLUMN_DEFAULT})`);
            });
        }

        process.exit(0);
    } catch (err) {
        console.error('Error checking schema:', err);
        process.exit(1);
    }
}

checkItemsSchema();
