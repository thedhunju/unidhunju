
const db = require('./db');

async function debugItemListing() {
    try {
        const userId = '019bf0f6-c67d-7049-9304-4b52dfbe5283'; // Existing user ID from previous test
        const title = 'Test Item';
        const description = 'Test Description';
        const price = 100;
        const category = 'books';
        const imageUrl = null;

        console.log('Attempting INSERT into items...');
        const [result] = await db.execute(
            'INSERT INTO items (uploaded_by, title, description, price, category, image_url) VALUES (?, ?, ?, ?, ?, ?)',
            [userId, title, description, price, category.toLowerCase(), imageUrl]
        );
        console.log('Item listing success in debug script!', result.insertId);
    } catch (err) {
        console.error('Item listing failed in debug script!');
        console.error('Error Code:', err.code);
        console.error('Error Message:', err.message);
    } finally {
        process.exit(0);
    }
}

debugItemListing();
