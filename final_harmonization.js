
const db = require('./db');

async function finalHarmonization() {
    try {
        console.log('--- Starting Final Schema Harmonization ---');

        // 1. Repair Users Table
        console.log('Harmonizing users table...');
        const [userCols] = await db.query("SHOW COLUMNS FROM users");
        const userFields = userCols.map(c => c.Field);
        if (!userFields.includes('picture')) {
            console.log('Adding "picture" to users...');
            await db.execute('ALTER TABLE users ADD COLUMN picture varchar(255) DEFAULT NULL');
        } else {
            await db.execute('ALTER TABLE users MODIFY COLUMN picture varchar(255) DEFAULT NULL');
        }

        // 2. Repair Items Table
        console.log('Harmonizing items table...');
        const [itemCols] = await db.query("SHOW COLUMNS FROM items");
        const itemFields = itemCols.map(c => c.Field);

        // Columns to ensure are nullable with default NULL
        const columnsToFix = [
            'name',          // User's column
            'image_path',    // User's column
            'title',         // Backend's column
            'image_url',     // Backend's column
            'item_condition' // Required by backend but missing in some flows
        ];

        for (const colName of columnsToFix) {
            const col = itemCols.find(c => c.Field === colName);
            if (col) {
                console.log(`Making "${colName}" nullable...`);
                // Use VARCHAR(255) for user cols if they were restricted, or keep existing type
                const type = col.Type;
                await db.execute(`ALTER TABLE items MODIFY COLUMN ${colName} ${type} DEFAULT NULL`);
            } else if (colName === 'title' || colName === 'image_url') {
                // Backend absolutely needs these
                console.log(`Adding missing backend column "${colName}"...`);
                await db.execute(`ALTER TABLE items ADD COLUMN ${colName} varchar(255) DEFAULT NULL`);
            }
        }

        // 3. Make Category more flexible to avoid truncation
        console.log('Flexing category column...');
        await db.execute('ALTER TABLE items MODIFY COLUMN category varchar(255) DEFAULT NULL');

        console.log('--- Harmonization Success! Running final verification... ---');

        const [users] = await db.execute('SELECT id FROM users LIMIT 1');
        if (users.length === 0) throw new Error('No users found for test');
        const userId = users[0].id;

        const [result] = await db.execute(
            "INSERT INTO items (uploaded_by, title, description, price, category, image_url) VALUES (?, 'Harmonized Test Item', 'This should truly work now', 500.00, 'books', NULL)",
            [userId]
        );
        console.log('VERIFICATION PASSED! New Item ID:', result.insertId);

    } catch (err) {
        console.error('CRITICAL ERROR DURING HARMONIZATION:', err.message);
    } finally {
        process.exit(0);
    }
}

finalHarmonization();
