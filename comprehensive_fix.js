
const db = require('./db');

async function comprehensiveFix() {
    try {
        console.log('--- Starting Comprehensive Schema Reconciliation ---');

        // 1. Fix Users Table (ensure picture is nullable)
        console.log('Inspecting users table...');
        const [userCols] = await db.execute('DESCRIBE users');
        const userFields = userCols.map(c => c.Field);
        if (!userFields.includes('picture')) {
            console.log('Adding "picture" to users...');
            await db.execute('ALTER TABLE users ADD COLUMN picture varchar(255) DEFAULT NULL');
        } else {
            console.log('Ensuring "picture" is nullable...');
            await db.execute('ALTER TABLE users MODIFY COLUMN picture varchar(255) DEFAULT NULL');
        }

        // 2. Fix Items Table
        console.log('Inspecting items table...');
        const [itemCols] = await db.execute('DESCRIBE items');
        const itemFields = itemCols.map(c => c.Field);

        const columnsToMakeNullable = [
            { name: 'name', type: 'varchar(255)' },
            { name: 'image_path', type: 'varchar(255)' },
            { name: 'item_condition', type: "enum('new','decent','too old')" },
            { name: 'image_url', type: 'varchar(255)' },
            { name: 'title', type: 'varchar(255)' }
        ];

        for (const col of columnsToMakeNullable) {
            if (itemFields.includes(col.name)) {
                console.log(`Making "${col.name}" nullable...`);
                await db.execute(`ALTER TABLE items MODIFY COLUMN ${col.name} ${col.type} DEFAULT NULL`);
            }
        }

        console.log('--- Reconciliation Success! Running final test... ---');
        const [result] = await db.execute(
            "INSERT INTO items (uploaded_by, title, description, price, category, image_url) VALUES ('019bf0f6-c67d-7049-9304-4b52dfbe5283', 'Final Smooth Test', 'Reconciliation successful', 123.45, 'other', NULL)"
        );
        console.log('TEST PASSED! Item ID:', result.insertId);

    } catch (err) {
        console.error('CRITICAL FAILURE:', err.message);
    } finally {
        process.exit(0);
    }
}

comprehensiveFix();
