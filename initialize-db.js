const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function initializeDatabase() {
    const config = {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        multipleStatements: true
    };

    try {
        const connection = await mysql.createConnection(config);
        console.log('Connected to MySQL server.');

        // Create database if not exists
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'unifindc2c'}\`;`);
        console.log(`Database "${process.env.DB_NAME || 'unifindc2c'}" ensured.`);

        // Switch to the database
        await connection.query(`USE \`${process.env.DB_NAME || 'unifindc2c'}\`;`);

        // Read and execute database.sql
        const sqlPath = path.join(__dirname, 'database.sql');
        let sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Cleaning up existing tables for a fresh setup...');
        // Drop tables in reverse order of dependencies to avoid FK constraints
        const tablesToDrop = ['notifications', 'bookings', 'comments', 'items', 'users'];
        for (const table of tablesToDrop) {
            await connection.query(`DROP TABLE IF EXISTS \`${table}\`;`);
        }

        console.log('Applying schema from database.sql...');

        // Execute the whole file using multipleStatements: true
        await connection.query(sql);

        console.log('Database schema applied successfully.');
        await connection.end();
        process.exit(0);
    } catch (err) {
        console.error('Error during database initialization:', err.message);
        if (err.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error('Access denied. Please check your DB_USER and DB_PASSWORD in .env');
        }
        process.exit(1);
    }
}

initializeDatabase();
