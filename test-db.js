const mysql = require('mysql2/promise');

const passwords = ['', 'root', 'password', 'admin', '1234', '123456', 'mysql', 'pujan', 'Pujan', 'unifind', 'UniFind', 'uni_find'];

async function test() {
    for (const pwd of passwords) {
        console.log(`Testing password: "${pwd}"`);
        try {
            const connection = await mysql.createConnection({
                host: '127.0.0.1',
                user: 'root',
                password: pwd
            });
            console.log(`SUCCESS! Password is: "${pwd}"`);
            await connection.end();
            process.exit(0);
        } catch (err) {
            console.log(`Failed: ${err.message}`);
        }
    }
    console.log('No common passwords worked.');
    process.exit(1);
}

test();
