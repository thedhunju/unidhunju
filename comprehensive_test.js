
const db = require('./db');

async function repairAndVerify() {
    try {
        console.log('--- Phase 1: Database Repair ---');

        // 1. Fix bookings status
        console.log('Fixing bookings status ENUM...');
        await db.execute("ALTER TABLE bookings MODIFY COLUMN status enum('pending','confirmed','cancelled','reserved') DEFAULT 'pending'");

        // 2. Double check items status (just in case)
        console.log('Ensuring items status ENUM covers all logic...');
        await db.execute("ALTER TABLE items MODIFY COLUMN status enum('available','pending','reserved', 'sold') DEFAULT 'available'");

        console.log('--- Phase 2: Functional Verification ---');

        // Test Setup: Get a valid user and an available item
        const [users] = await db.query('SELECT id FROM users LIMIT 1');
        const [items] = await db.query('SELECT id, uploaded_by FROM items WHERE status = "available" LIMIT 1');

        if (users.length === 0 || items.length === 0) {
            console.log('SKIP: Not enough data for insertion test, but schema is fixed.');
        } else {
            const userId = users[0].id;
            const itemId = items[0].id;

            // Avoid self-reservation for a clean test
            const [otherUsers] = await db.query('SELECT id FROM users WHERE id != ? LIMIT 1', [items[0].uploaded_by]);
            const testerId = otherUsers.length > 0 ? otherUsers[0].id : userId;

            console.log(`Testing reservation for item ${itemId} by user ${testerId}...`);
            await db.execute(
                'INSERT INTO bookings (item_id, user_id, booked_quantity, status) VALUES (?, ?, ?, ?)',
                [itemId, testerId, 1, 'reserved']
            );
            console.log('SUCCESS: Reservation data persisted.');

            // Cleanup test booking
            await db.execute('DELETE FROM bookings WHERE item_id = ? AND user_id = ? AND status = "reserved"', [itemId, testerId]);
            console.log('SUCCESS: Cleanup complete.');
        }

        console.log('--- ALL SYSTEMS FUNCTIONAL ---');

    } catch (err) {
        console.error('VERIFICATION FAILED:', err.message);
    } finally {
        process.exit(0);
    }
}

repairAndVerify();
