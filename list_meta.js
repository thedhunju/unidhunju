
const mysql = require('mysql2/promise');
require('dotenv').config();

async function debugDB() {
    console.log('DB_HOST:', process.env.DB_HOST);
    console.log('DB_USER:', process.env.DB_USER);
    console.log('DB_NAME:', process.env.DB_NAME);
    const config = {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT,
    };

    try {
        const connection = await mysql.createConnection(config);
        console.log('--- ALL DATABASES ---');
        const [databases] = await connection.query('SHOW DATABASES');
        databases.forEach(db => console.log(db.Database));

        console.log('--- TABLES ---');
        await connection.query(`USE ${process.env.DB_NAME}`);
        const [tables] = await connection.query('SHOW TABLES');
        for (const t of tables) {
            const tableName = Object.values(t)[0];
            const [rows] = await connection.query(`SELECT * FROM ${tableName}`);
            console.log(`${tableName}: ${rows.length} rows`);
            if (tableName === 'items') {
                rows.forEach(r => console.log(`Item ID: ${r.id}, Status: ${r.status}, UploadedBy: ${r.uploaded_by}, Title: ${r.title}`));
            }
            if (tableName === 'users') {
                rows.forEach(r => console.log(`User ID: ${r.id}, Name: ${r.name}, Email: ${r.email}`));
            }
        }
        await connection.end();
    } catch (err) {
        console.error('ERROR:', err.message);
    }
}

debugDB();
