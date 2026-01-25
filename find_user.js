
const db = require('./db');
async function findUser() {
    try {
        const [rows] = await db.execute('SELECT email FROM users LIMIT 1');
        console.log('Valid User Email:', rows[0].email);
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        process.exit(0);
    }
}
findUser();
