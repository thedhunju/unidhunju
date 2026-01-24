
const db = require('./db');

async function fix() {
    try {
        console.log('Fixing item_condition...');
        await db.execute("ALTER TABLE items MODIFY COLUMN item_condition enum('new','decent','too old') DEFAULT NULL");

        console.log('Fixing image_url...');
        await db.execute("ALTER TABLE items MODIFY COLUMN image_url varchar(255) DEFAULT NULL");

        console.log('Verifying with insert...');
        const [result] = await db.execute(
            "INSERT INTO items (uploaded_by, title, description, price, category, image_url) VALUES ('019bf0f6-c67d-7049-9304-4b52dfbe5283', 'Final Test', 'Should work now', 75, 'other', NULL)"
        );
        console.log('SUCCESS! New Item ID:', result.insertId);
    } catch (err) {
        console.error('FAILURE:', err.message);
    } finally {
        process.exit(0);
    }
}

fix();
