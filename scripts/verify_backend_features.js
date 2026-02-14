const mysql = require('mysql2/promise');
require('dotenv').config();

async function verifyBackend() {
    let connection;
    try {
        console.log('Connecting to database...');
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        console.log('1. Checking notifications table schema...');
        const [columns] = await connection.execute('DESCRIBE notifications');
        const columnNames = columns.map(c => c.Field);
        console.log('Columns found:', columnNames.join(', '));

        const requiredColumns = ['id', 'user_id', 'message', 'type', 'is_read', 'created_at', 'item_id'];
        const missing = requiredColumns.filter(c => !columnNames.includes(c));

        if (missing.length === 0) {
            console.log('PASS: All keys columns present.');
        } else {
            console.error('FAIL: Missing columns:', missing);
        }

        console.log('2. Testing Insert/Select...');
        // Need a valid user_id. Let's try to find one or fail gracefully if empty DB
        const [users] = await connection.execute('SELECT id FROM users LIMIT 1');
        if (users.length > 0) {
            const userId = users[0].id;
            console.log(`Testing with user ID: ${userId}`);

            await connection.execute(
                'INSERT INTO notifications (user_id, message, type) VALUES (?, ?, ?)',
                [userId, 'Test Notification', 'info']
            );

            const [rows] = await connection.execute('SELECT * FROM notifications WHERE user_id = ? AND message = ?', [userId, 'Test Notification']);
            if (rows.length > 0) {
                console.log('PASS: Notification inserted and retrieved.');
                // Cleanup
                await connection.execute('DELETE FROM notifications WHERE id = ?', [rows[0].id]);
                console.log('Cleanup successful.');
            } else {
                console.error('FAIL: Could not retrieve inserted notification.');
            }

        } else {
            console.log('SKIPPING Insert test: No users found in DB.');
        }

    } catch (error) {
        console.error('Verification FAILED:', error);
    } finally {
        if (connection) await connection.end();
    }
}

verifyBackend();
