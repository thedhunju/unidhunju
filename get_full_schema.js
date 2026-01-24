
const db = require('./db');

async function getFullInfo() {
    try {
        const [rows1] = await db.execute('SHOW CREATE TABLE bookings');
        console.log('--- CREATE TABLE BOOKINGS ---');
        console.log(rows1[0]['Create Table']);

        const [rows2] = await db.execute('SHOW CREATE TABLE items');
        console.log('\n--- CREATE TABLE ITEMS ---');
        console.log(rows2[0]['Create Table']);

        console.log('\n--- END ---');
    } catch (err) {
        console.error(err);
    } finally {
        process.exit(0);
    }
}

getFullInfo();
