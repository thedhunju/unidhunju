
const db = require('./db');

async function debugSQL() {
    try {
        const query = 'SELECT items.*, users.name as seller_name, users.picture as seller_picture FROM items JOIN users ON items.uploaded_by = users.id WHERE items.status IN ("available", "reserved")';
        console.log('--- STARTING QUERY ---');
        const [rows] = await db.execute(query);
        console.log('--- QUERY SUCCESS ---');
        console.log('Items found:', rows.length);
    } catch (err) {
        console.log('--- QUERY FAILED ---');
        console.log('CODE:', err.code);
        console.log('MESSAGE:', err.message);
    } finally {
        process.exit(0);
    }
}

debugSQL();
