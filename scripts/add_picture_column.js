const db = require('../db');

async function addPictureColumn() {
    try {
        console.log('Attempting to add "picture" column to users table...');

        try {
            await db.execute('ALTER TABLE users ADD COLUMN picture VARCHAR(255) DEFAULT NULL');
            console.log('SUCCESS: Added "picture" column.');
        } catch (err) {
            if (err.code === 'ER_DUP_FIELDNAME') {
                console.log('INFO: "picture" column already exists.');
            } else {
                throw err;
            }
        }

        process.exit(0);
    } catch (err) {
        console.error('Error adding column:', err);
        process.exit(1);
    }
}

addPictureColumn();
