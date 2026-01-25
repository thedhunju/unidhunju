const db = require('./db');

async function test() {
    try {
        const [users] = await db.execute('SELECT COUNT(*) as count FROM users');
        console.log('Users count:', users[0].count);

        const [items] = await db.execute('SELECT COUNT(*) as count FROM items');
        console.log('Items count:', items[0].count);

        const [availableItems] = await db.execute('SELECT COUNT(*) as count FROM items WHERE status = "available"');
        console.log('Available items count:', availableItems[0].count);

        const [joinedItems] = await db.execute(
            'SELECT COUNT(*) as count FROM items JOIN users ON items.uploaded_by = users.id WHERE items.status = "available"'
        );
        console.log('Joined available items count:', joinedItems[0].count);

        process.exit(0);
    } catch (err) {
        console.error('DB Diagnostic Error:', err);
        process.exit(1);
    }
}

test();
