
const db = require('./db');

async function test() {
    try {
        const [result] = await db.execute(
            "INSERT INTO items (uploaded_by, title, description, price, category, image_url) VALUES ('019bf0f6-c67d-7049-9304-4b52dfbe5283', 'Simple Test', 'Just a desc', 50, 'other', NULL)"
        );
        console.log('Final Verification Success! Item ID:', result.insertId);
    } catch (err) {
        console.error('Final Verification Failed:', err.message);
    } finally {
        process.exit(0);
    }
}

test();
