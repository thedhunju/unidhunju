
const axios = require('axios');

async function testFetchItems() {
    try {
        const response = await axios.get('http://localhost:5000/api/items');
        console.log('Fetch Items Success:', response.data.length, 'items found.');
    } catch (error) {
        if (error.response) {
            console.error('Error Response:', error.response.data);
            console.error('Status:', error.response.status);
        } else {
            console.error('Error:', error.message);
        }
    }
}

testFetchItems();
