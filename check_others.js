
const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkOthers() {
    const dbs = ['unifind', 'unifind_db', 'unifindc2c', 'uniproject'];
    const config = {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT,
    };

    try {
        const connection = await mysql.createConnection(config);
        for (const dbName of dbs) {
            try {
                await connection.query(`USE ${dbName}`);
                const [count] = await connection.query('SELECT COUNT(*) as cnt FROM items');
                console.log(`${dbName} items: ${count[0].cnt}`);
            } catch (e) {
                console.log(`${dbName} (no items table or inaccessible)`);
            }
        }
        await connection.end();
    } catch (err) {
        console.error(err.message);
    }
}
checkOthers();
