const express = require('express');
const router = express.Router();
const axios = require('axios');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

// Middleware to check for token (for demonstration purposes)
const authenticateToken = (req, res, next) => {
    const token = req.headers.authorization;
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    // Implement token verification logic here
    // For now, let's just assume the token is valid
    console.log('Token received:', token);
    next();
};

// User registration endpoint
router.post('/register', async (req, res) => {
    try {
        const { email } = req.body;

        // Check if the user already exists
        const existingUser = users.find(user => user.email === email);
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Save the user to the in-memory storage
        users.push({ email });

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Verify OTP endpoint
router.post('/verifyOTP', async (req, res) => {
    try {
        const { email, otp } = req.body;

        // Implement your OTP verification logic here
        // For now, let's just send a success response

        // Simulate token generation by the backend
        const token = 'dummy-token'; // Replace with actual token generation logic

        res.status(200).json({ message: 'User verified successfully', data: { token } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Resend OTP endpoint
router.post('/resendOTP', async (req, res) => {
    try {
        const { email } = req.body;

        // Implement your OTP resend logic here
        // For now, let's just send a success response

        res.status(200).json({ message: 'OTP resent successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Set password endpoint
router.post('/setPassword', authenticateToken, async (req, res) => {
    try {
        const { password } = req.body;
        const token = req.headers.authorization; // Assuming the token is sent in the Authorization header

        // Implement your password setting logic here
        // For now, let's just send a success response

        res.status(200).json({ message: 'Password set successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update profile endpoint
router.post('/updateProfile', authenticateToken, async (req, res) => {
    try {
        const { name, phone, birthDate, gender, address } = req.body;
        const token = req.headers.authorization; // Assuming the token is sent in the Authorization header

        // Implement your profile update logic here
        // For now, let's just send a success response

        res.status(200).json({ message: 'Profile updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// User login endpoint
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Implement your user login logic here
        // For now, let's just send a success response

        res.status(200).json({ message: 'User logged in successfully', token: 'dummy-token' }); // Return a dummy token for demonstration
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get shop products endpoint
router.get('/shopProducts', authenticateToken, async (req, res) => {
    try {
        const { status } = req.query;
        const response = await axios.get(`${process.env.BASE_URL}/products/shopProducts`, {
            headers: {
                Authorization: `Bearer ${req.headers.authorization.split(' ')[1]}`
            },
            params: {
                status
            }
        });
        res.status(200).json(response.data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get products endpoint
router.get('/products', authenticateToken, async (req, res) => {
    try {
        const { category, minPrice, maxPrice, shopId } = req.query;
        const response = await axios.get(`${process.env.BASE_URL}/products`, {
            headers: {
                Authorization: `Bearer ${req.headers.authorization.split(' ')[1]}`
            },
            params: {
                category,
                minPrice,
                maxPrice,
                shopId
            }
        });
        res.status(200).json(response.data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
