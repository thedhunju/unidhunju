
const axios = require('axios');

async function testRegistration() {
    try {
        const response = await axios.post('http://localhost:5000/api/auth/kumail', {
            email: `test_${Date.now()}@student.ku.edu.np`,
            name: 'Verification User',
            type: 'register',
            password: 'password123'
        });
        console.log('Registration Response:', response.data);
    } catch (error) {
        if (error.response) {
            console.error('Error Response:', error.response.data);
            console.error('Status:', error.response.status);
        } else {
            console.error('Error:', error.message);
        }
    }
}

testRegistration();
