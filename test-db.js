const mysql = require('mysql2/promise');
require('dotenv').config();

async function testConnection() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT,
        });
        console.log('Successfully connected to the database!');
        const [rows] = await connection.execute('SHOW TABLES');
        console.log('Tables in database:', rows.map(r => Object.values(r)[0]));
        await connection.end();
    } catch (err) {
        console.error('Database connection failed:', err.message);
    }
}

testConnection();
