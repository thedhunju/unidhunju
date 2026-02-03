const axios = require('axios');
const fs = require('fs');

async function checkAuth() {
    try {
        const data = JSON.parse(fs.readFileSync('test-register.json', 'utf8'));
        const res = await axios.post('http://localhost:3000/api/auth/kumail', data);
        console.log('Success:', res.data);
    } catch (err) {
        if (err.response) {
            console.log('Error Status:', err.response.status);
            console.log('Error Data:', JSON.stringify(err.response.data, null, 2));
        } else {
            console.error('Error Message:', err.message);
        }
    }
}

checkAuth();
