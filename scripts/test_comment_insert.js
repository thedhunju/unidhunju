const db = require('../db');

async function testInsert() {
    try {
        console.log('Testing comment insertion...');

        // Find a valid user and item for testing
        const [users] = await db.execute('SELECT id FROM users LIMIT 1');
        const [items] = await db.execute('SELECT id FROM items LIMIT 1');

        if (users.length === 0 || items.length === 0) {
            console.log('Error: Need at least one user and one item in DB to test.');
            process.exit(1);
        }

        const userId = users[0].id;
        const itemId = items[0].id;

        console.log(`Using userId: ${userId}, itemId: ${itemId}`);

        const [result] = await db.execute(
            'INSERT INTO comments (item_id, user_id, comment_text, parent_comment_id) VALUES (?, ?, ?, ?)',
            [itemId, userId, 'Test comment from script', null]
        );

        console.log('Insertion successful, ID:', result.insertId);

        // Cleanup
        await db.execute('DELETE FROM comments WHERE id = ?', [result.insertId]);
        console.log('Test record deleted.');

        process.exit(0);
    } catch (err) {
        console.error('Insertion FAILED:', err);
        process.exit(1);
    }
}

testInsert();
