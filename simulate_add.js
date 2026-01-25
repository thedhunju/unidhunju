
const axios = require('axios');

async function simulateAddItem() {
    try {
        // First login to get a token (assuming bhavik@student.ku.edu.np exists)
        console.log('--- Attempting Login ---');
        const loginRes = await axios.post('http://localhost:5000/api/auth/kumail', {
            email: 'bhavik@student.ku.edu.np',
            password: 'password123', // I'll check what the password might be or just use a known user
            type: 'login'
        });

        const token = loginRes.data.token;
        console.log('Login successful, token obtained.');

        console.log('--- Attempting to Post Item ---');
        const itemRes = await axios.post('http://localhost:5000/api/items', {
            title: 'Test Item ' + Date.now(),
            description: 'This is a test item added via script',
            price: 100,
            category: 'test'
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('Item posted successfully:', itemRes.data);
    } catch (err) {
        console.error('Error:', err.response ? err.response.data : err.message);
    }
}

simulateAddItem();
