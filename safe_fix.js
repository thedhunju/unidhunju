
const db = require('./db');

async function safeFix() {
    try {
        console.log('--- Starting Safe Schema Reconciliation ---');

        // 1. Fix Users Table (picture) - Use a safer approach
        console.log('Ensuring "picture" column in users...');
        const [rows_u] = await db.query("SHOW COLUMNS FROM users LIKE 'picture'");
        if (rows_u.length === 0) {
            await db.execute('ALTER TABLE users ADD COLUMN picture varchar(255) DEFAULT NULL');
        } else {
            await db.execute('ALTER TABLE users MODIFY COLUMN picture varchar(255) DEFAULT NULL');
        }

        // 2. Fix Items Table - Targeted columns only
        const targetCols = ['name', 'image_path', 'item_condition', 'title', 'image_url'];
        for (const col of targetCols) {
            console.log(`Ensuring ${col} is nullable with default NULL in items...`);
            const [rows_i] = await db.query(`SHOW COLUMNS FROM items LIKE '${col}'`);
            if (rows_i.length > 0) {
                const type = rows_i[0].Type;
                await db.execute(`ALTER TABLE items MODIFY COLUMN ${col} ${type} DEFAULT NULL`);
            }
        }

        console.log('--- Testing insertion... ---');
        // Search for a valid user ID first to ensure FK success
        const [users] = await db.execute('SELECT id FROM users LIMIT 1');
        if (users.length === 0) throw new Error('No users found to test insertion');
        const userId = users[0].id;

        const [result] = await db.execute(
            "INSERT INTO items (uploaded_by, title, description, price, category, image_url) VALUES (?, 'Safe Test', 'Reconciliation worked', 99.99, 'electronics', NULL)",
            [userId]
        );
        console.log('SUCCESS! Registered item ID:', result.insertId);

    } catch (err) {
        console.error('ERROR:', err.message);
    } finally {
        process.exit(0);
    }
}

safeFix();
