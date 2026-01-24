
const db = require('./db');

async function debugReservation() {
    try {
        // Find a user and an available item to test with
        const [users] = await db.execute('SELECT id FROM users LIMIT 1');
        const [items] = await db.execute('SELECT id, uploaded_by FROM items WHERE status = "available" LIMIT 1');

        if (users.length === 0 || items.length === 0) {
            console.error('No users or available items found to test reservation.');
            process.exit(1);
        }

        const userId = users[0].id; // Test user
        let item = items[0];

        // Ensure we don't reserve our own item
        if (item.uploaded_by === userId) {
            const [otherUsers] = await db.execute('SELECT id FROM users WHERE id != ? LIMIT 1', [userId]);
            if (otherUsers.length > 0) {
                // Use a different user
                console.log('Using different user to avoid self-reservation');
                const testUserId = otherUsers[0].id;
                await runTest(item.id, testUserId);
            } else {
                console.error('Not enough users to test reservation without self-reservation.');
            }
        } else {
            await runTest(item.id, userId);
        }

    } catch (err) {
        console.error('Setup error:', err);
    } finally {
        process.exit(0);
    }
}

async function runTest(itemId, userId) {
    try {
        console.log(`Attempting to reserve item ${itemId} for user ${userId}...`);

        // 1. Create Booking
        await db.execute(
            'INSERT INTO bookings (item_id, user_id, booked_quantity, status) VALUES (?, ?, ?, ?)',
            [itemId, userId, 1, 'reserved']
        );
        console.log('Booking INSERT success');

        // 2. Update Item Status
        await db.execute('UPDATE items SET status = ? WHERE id = ?', ['reserved', itemId]);
        console.log('Item UPDATE success');

        console.log('Reservation functional test PASSED');
    } catch (err) {
        console.error('Reservation functional test FAILED');
        console.error('Error Code:', err.code);
        console.error('Error Message:', err.message);
    }
}

debugReservation();
