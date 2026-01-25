
const axios = require('axios');
const FormData = require('form-data');

async function testFlow() {
    const baseUrl = 'http://localhost:5000/api';
    const testEmail = `test_${Date.now()}@student.ku.edu.np`;

    try {
        console.log('--- Registering Test User ---');
        const regRes = await axios.post(`${baseUrl}/auth/kumail`, {
            email: testEmail,
            name: 'Test Agent',
            password: 'password123',
            type: 'register'
        });

        const token = regRes.data.token;
        console.log('User registered, token obtained.');

        console.log('--- Attempting to Post Item (Multipart) ---');
        const form = new FormData();
        form.append('title', 'Agent Test Item ' + Date.now());
        form.append('description', 'Item added by AI for verification after fix');
        form.append('price', '50');
        form.append('category', 'electronics');
        form.append('condition', 'new');

        const itemRes = await axios.post(`${baseUrl}/items`, form, {
            headers: {
                Authorization: `Bearer ${token}`,
                ...form.getHeaders()
            }
        });

        console.log('Item posted success:', itemRes.data);
        console.log('Check DB for email:', testEmail);
    } catch (err) {
        console.error('Error:', err.response ? err.response.data : err.message);
    }
}

testFlow();
