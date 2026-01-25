
const db = require('./db');
async function checkSchema() {
    try {
        const [rows] = await db.execute('DESCRIBE items');
        console.log('Schema for items:');
        rows.forEach(r => console.log(`${r.Field} - ${r.Type} - Null: ${r.Null} - Key: ${r.Key}`));
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        process.exit(0);
    }
}
checkSchema();
