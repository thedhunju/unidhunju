const mysql = require('mysql2/promise');
require('dotenv').config();

async function migrate() {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT,
        });

        console.log('Adding missing columns to users table...');

        const columns = [
            'ALTER TABLE users ADD COLUMN is_verified TINYINT(1) DEFAULT 0',
            'ALTER TABLE users ADD COLUMN verification_otp VARCHAR(6) DEFAULT NULL',
            'ALTER TABLE users ADD COLUMN verification_otp_expires DATETIME DEFAULT NULL',
            'ALTER TABLE users ADD COLUMN reset_otp VARCHAR(6) DEFAULT NULL',
            'ALTER TABLE users ADD COLUMN reset_otp_expires DATETIME DEFAULT NULL',
            'ALTER TABLE users ADD COLUMN picture VARCHAR(255) DEFAULT NULL',
            'ALTER TABLE users ADD COLUMN instagram_handle VARCHAR(255) DEFAULT NULL',
            'ALTER TABLE users ADD COLUMN whatsapp_number VARCHAR(20) DEFAULT NULL',
            'ALTER TABLE users ADD COLUMN facebook_link VARCHAR(255) DEFAULT NULL'
        ];

        for (const query of columns) {
            try {
                await connection.execute(query);
                console.log(`Executed: ${query}`);
            } catch (err) {
                if (err.code === 'ER_DUP_COLUMN_NAME') {
                    console.log(`Column already exists, skipping...`);
                } else {
                    throw err;
                }
            }
        }

        console.log('Migration completed successfully!');
    } catch (err) {
        console.error('Migration failed:', err.message);
    } finally {
        if (connection) await connection.end();
    }
}

migrate();
