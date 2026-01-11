const db = require('./db');
require('dotenv').config();

async function testEmailSetup() {
    console.log('=== Email Configuration Test ===\n');

    // 1. Check environment variables
    console.log('1. Checking .env variables:');
    console.log('   EMAIL_USER:', process.env.EMAIL_USER ? '✓ Set' : '✗ Not set');
    console.log('   EMAIL_PASS:', process.env.EMAIL_PASS ? '✓ Set' : '✗ Not set');

    if (process.env.EMAIL_USER) {
        console.log('   EMAIL_USER value:', process.env.EMAIL_USER);
        if (!process.env.EMAIL_USER.endsWith('@gmail.com')) {
            console.log('   ⚠️  WARNING: EMAIL_USER should be a @gmail.com address, not a university email');
        }
    }

    // 2. Check database columns
    console.log('\n2. Checking database for reset_otp columns:');
    try {
        const [columns] = await db.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'users'
    `);
        const columnNames = columns.map(c => c.COLUMN_NAME);
        console.log('   reset_otp:', columnNames.includes('reset_otp') ? '✓ Exists' : '✗ Missing');
        console.log('   reset_otp_expires:', columnNames.includes('reset_otp_expires') ? '✓ Exists' : '✗ Missing');
    } catch (err) {
        console.log('   ✗ Database error:', err.message);
    }

    // 3. Test nodemailer if configured
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        console.log('\n3. Testing email connection:');
        try {
            const nodemailer = require('nodemailer');
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                }
            });

            await transporter.verify();
            console.log('   ✓ Email connection successful!');
        } catch (err) {
            console.log('   ✗ Email connection failed:', err.message);
            if (err.message.includes('Invalid login')) {
                console.log('   → Make sure EMAIL_USER is a Gmail address and EMAIL_PASS is a Gmail App Password');
            }
        }
    } else {
        console.log('\n3. Email not configured (will use Mock Mode)');
    }

    console.log('\n=== Test Complete ===');
    process.exit(0);
}

testEmailSetup().catch(err => {
    console.error('Test failed:', err);
    process.exit(1);
});
