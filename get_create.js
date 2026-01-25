
const db = require('./db');
async function getCreate() {
    try {
        const [rows] = await db.execute('SHOW CREATE TABLE items');
        console.log(rows[0]['Create Table']);
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        process.exit(0);
    }
}
getCreate();
