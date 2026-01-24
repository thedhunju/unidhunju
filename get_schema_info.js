
const db = require('./db');

async function getFullInfo() {
    try {
        const [rows] = await db.execute('SHOW CREATE TABLE items');
        console.log('--- CREATE TABLE ITEMS ---');
        console.log(rows[0]['Create Table']);
        console.log('--- END ---');
    } catch (err) {
        console.error(err);
    } finally {
        process.exit(0);
    }
}

getFullInfo();
