
const db = require('./db');

async function fixItemConstraints() {
    try {
        console.log('--- Relaxing Item Constraints ---');

        // Make item_condition optional (NULL)
        console.log('Relaxing "item_condition" constraint...');
        await db.execute("ALTER TABLE items MODIFY COLUMN item_condition enum('new','decent','too old') DEFAULT NULL");

        // Make image_url optional (NULL)
        console.log('Relaxing "image_url" constraint...');
        await db.execute("ALTER TABLE items MODIFY COLUMN image_url varchar(255) DEFAULT NULL");

        console.log('--- Constraints Successfully Relaxed ---');
    } catch (err) {
        console.error('Failed to relax constraints:', err.message);
    } finally {
        process.exit(0);
    }
}

fixItemConstraints();
