const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v7: uuidv7 } = require('uuid');
const db = require('../db');
const { JWT_SECRET } = require('../middleware/auth');
const nodemailer = require('nodemailer');

// Helper to send OTP
async function sendOTP(email, otp, type) {
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: `UniFind - ${type} OTP`,
            text: `Your ${type.toLowerCase()} verification code is: ${otp}\n\nThis code expires in 15 minutes.`
        };

        await transporter.sendMail(mailOptions);
    } else {
        console.log('---------------------------------------------------');
        console.log(`[MOCK EMAIL SERVICE] To: ${email}`);
        console.log(`[MOCK EMAIL SERVICE] Subject: ${type} OTP`);
        console.log(`[MOCK EMAIL SERVICE] Your verification code is: ${otp}`);
        console.log('---------------------------------------------------');
    }
}

// 1. Auth - Simple REST API (KUmail only)
router.post('/kumail', async (req, res) => {
    try {
        const { email, name, type, password } = req.body; // type: 'login' or 'register'

        // Validate KUmail domain - accept both @ku.edu.np and @student.ku.edu.np
        const isValidKUmail = email.endsWith('@ku.edu.np') || email.endsWith('@student.ku.edu.np');

        if (!isValidKUmail) {
            return res.status(403).json({
                error: 'Access restricted to verified Kathmandu University students only.'
            });
        }

        if (!password || password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
        }

        // Check if user exists
        const [existingUsers] = await db.execute(
            'SELECT id, email, name, password, is_verified FROM users WHERE email = ?',
            [email]
        );

        let user;

        if (type === 'login') {
            if (existingUsers.length === 0) {
                return res.status(404).json({ error: 'Account not found. Please register first.' });
            }
            user = existingUsers[0];

            if (!user.is_verified) {
                return res.status(403).json({
                    error: 'Account not verified. Please check your email for the verification code.',
                    unverified: true
                });
            }

            const validPassword = await bcrypt.compare(password, user.password || '');
            if (!validPassword) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

        } else if (type === 'register') {
            if (existingUsers.length > 0) {
                const existing = existingUsers[0];
                if (existing.is_verified) {
                    return res.status(409).json({ error: 'User already exists. Please login.' });
                }
                // If exists but not verified, we'll just update the OTP and password
                const otp = Math.floor(100000 + Math.random() * 900000).toString();
                const expiry = new Date(Date.now() + 15 * 60 * 1000);
                const hashedPassword = await bcrypt.hash(password, 10);
                const userName = name || email.split('@')[0];

                await db.execute(
                    'UPDATE users SET name = ?, password = ?, verification_otp = ?, verification_otp_expires = ? WHERE email = ?',
                    [userName, hashedPassword, otp, expiry, email]
                );

                // Send OTP
                await sendOTP(email, otp, 'Registration');

                return res.json({
                    message: 'Verification code sent to your email.',
                    requiresVerification: true
                });
            }
            // Create new unverified user
            const userName = name || email.split('@')[0];
            const userId = uuidv7();
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            const expiry = new Date(Date.now() + 15 * 60 * 1000);
            const hashedPassword = await bcrypt.hash(password, 10);

            await db.execute(
                'INSERT INTO users (id, name, email, password, verification_otp, verification_otp_expires, is_verified) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [userId, userName, email, hashedPassword, otp, expiry, false]
            );

            // Send OTP
            await sendOTP(email, otp, 'Registration');

            return res.json({
                message: 'Verification code sent to your email.',
                requiresVerification: true
            });
        } else {
            return res.status(400).json({ error: 'Invalid auth type' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user.id, email: user.email, name: user.name },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Return user without password
        res.json({
            token,
            user: { id: user.id, name: user.name, email: user.email }
        });
    } catch (err) {
        console.error('Auth error:', err);
        res.status(500).json({ error: 'Authentication failed' });
    }
});

// Forgot Password - Send OTP
router.post('/forgot-password', async (req, res) => {
    console.log('==========================================');
    console.log('[FORGOT PASSWORD] Endpoint called');
    console.log('[FORGOT PASSWORD] Email:', req.body.email);
    console.log('==========================================');

    try {
        const { email } = req.body;

        // Check if user exists
        const [users] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(404).json({ error: 'User with this email does not exist.' });
        }

        // Generate 6 digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiry = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

        // Save to DB
        await db.execute(
            'UPDATE users SET reset_otp = ?, reset_otp_expires = ? WHERE email = ?',
            [otp, expiry, email]
        );

        await sendOTP(email, otp, 'Password Reset');
        res.json({ message: 'Password reset code sent to your email.' });

    } catch (err) {
        console.error('Forgot Password error:', err);
        res.status(500).json({ error: 'Failed to process request' });
    }
});

// Reset Password - Verify OTP and Update
router.post('/reset-password', async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
        }

        // Verify OTP
        const [users] = await db.execute(
            'SELECT id, reset_otp, reset_otp_expires FROM users WHERE email = ?',
            [email]
        );

        if (users.length === 0) return res.status(400).json({ error: 'Invalid request' });

        const user = users[0];

        if (!user.reset_otp || user.reset_otp !== otp) {
            return res.status(400).json({ error: 'Invalid confirmation code' });
        }

        if (new Date(user.reset_otp_expires) < new Date()) {
            return res.status(400).json({ error: 'Confirmation code has expired. Please request a new one.' });
        }

        // Update Password and Clear OTP
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await db.execute(
            'UPDATE users SET password = ?, reset_otp = NULL, reset_otp_expires = NULL WHERE id = ?',
            [hashedPassword, user.id]
        );

        res.json({ message: 'Password has been reset successfully. You can now login.' });

    } catch (err) {
        console.error('Reset Password error:', err);
        res.status(500).json({ error: 'Failed to reset password' });
    }
});

// Verify Registration OTP
router.post('/verify-registration', async (req, res) => {
    try {
        const { email, otp } = req.body;

        const [users] = await db.execute(
            'SELECT id, name, email, verification_otp, verification_otp_expires FROM users WHERE email = ?',
            [email]
        );

        if (users.length === 0) return res.status(400).json({ error: 'User not found' });

        const user = users[0];

        if (!user.verification_otp || user.verification_otp !== otp) {
            return res.status(400).json({ error: 'Invalid verification code' });
        }

        if (new Date(user.verification_otp_expires) < new Date()) {
            return res.status(400).json({ error: 'Verification code has expired. Please register again.' });
        }

        // Mark as verified
        await db.execute(
            'UPDATE users SET is_verified = 1, verification_otp = NULL, verification_otp_expires = NULL WHERE id = ?',
            [user.id]
        );

        // Generate JWT token
        const token = jwt.sign(
            { id: user.id, email: user.email, name: user.name },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: { id: user.id, name: user.name, email: user.email },
            message: 'Email verified successfully!'
        });

    } catch (err) {
        console.error('Verify Registration error:', err);
        res.status(500).json({ error: 'Failed to verify email' });
    }
});

module.exports = router;
