const mysql = require('mysql2/promise');
require('dotenv').config();

async function addNotificationsTable() {
    let connection;
    try {
        console.log('Connecting to database...');
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        console.log('Creating notifications table if not exists...');
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS notifications (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id VARCHAR(36) NOT NULL,
                message TEXT NOT NULL,
                type VARCHAR(50) DEFAULT 'info',
                is_read BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                item_id INT,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE SET NULL
            )
        `);

        console.log('Notifications table created/verified successfully.');

    } catch (error) {
        console.error('Error creating notifications table:', error);
    } finally {
        if (connection) await connection.end();
    }
}

addNotificationsTable();
