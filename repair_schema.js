
const db = require('./db');

async function repairSchema() {
    try {
        console.log('--- Checking and Repairing Schema ---');

        // 1. Check users table
        const [userCols] = await db.execute('DESCRIBE users');
        const userFields = userCols.map(c => c.Field);
        if (!userFields.includes('picture')) {
            console.log('Adding "picture" column to "users"...');
            await db.execute('ALTER TABLE users ADD COLUMN picture varchar(255) DEFAULT NULL AFTER password');
        }

        // 2. Check items table
        const [itemCols] = await db.execute('DESCRIBE items');
        const itemFields = itemCols.map(c => c.Field);

        if (!itemFields.includes('title') && itemFields.includes('name')) {
            console.log('Adding "title" column to "items" (synced from "name")...');
            await db.execute('ALTER TABLE items ADD COLUMN title varchar(255) NOT NULL AFTER id');
            await db.execute('UPDATE items SET title = name');
        } else if (!itemFields.includes('title')) {
            console.log('Adding "title" column to "items"...');
            await db.execute('ALTER TABLE items ADD COLUMN title varchar(255) NOT NULL AFTER id');
        }

        if (!itemFields.includes('image_url') && itemFields.includes('image_path')) {
            console.log('Adding "image_url" column to "items" (synced from "image_path")...');
            await db.execute('ALTER TABLE items ADD COLUMN image_url varchar(255) DEFAULT NULL AFTER price');
            await db.execute('UPDATE items SET image_url = image_path');
        } else if (!itemFields.includes('image_url')) {
            console.log('Adding "image_url" column to "items"...');
            await db.execute('ALTER TABLE items ADD COLUMN image_url varchar(255) DEFAULT NULL AFTER price');
        }

        console.log('--- Schema Repair Completed Successfully ---');
    } catch (err) {
        console.error('Repair Failed:', err.message);
    } finally {
        process.exit(0);
    }
}

repairSchema();
