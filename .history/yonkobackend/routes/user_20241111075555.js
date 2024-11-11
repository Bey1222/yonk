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
        const { status, shopId } = req.query;
        console.log('Fetching shop products with status:', status, 'and shopId:', shopId);
        const response = await axios.get(`${process.env.BASE_URL}/products/shopProducts`, {
            headers: {
                Authorization: `Bearer ${req.headers.authorization.split(' ')[1]}`
            },
            params: {
                status,
                shopId
            }
        });
        res.status(200).json(response.data);
    } catch (error) {
        console.error('Error fetching shop products:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get products endpoint
router.get('/products', authenticateToken, async (req, res) => {
    try {
        const { category, minPrice, maxPrice, shopId } = req.query;
        console.log('Fetching products with category:', category, 'minPrice:', minPrice, 'maxPrice:', maxPrice, 'shopId:', shopId);
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
        console.error('Error fetching products:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get shops endpoint
router.get('/shops', authenticateToken, async (req, res) => {
    try {
        const { category, subscription } = req.query;
        console.log('Fetching shops with category:', category, 'and subscription:', subscription);
        const response = await axios.get(`${process.env.BASE_URL}/shops`, {
            headers: {
                Authorization: `Bearer ${req.headers.authorization.split(' ')[1]}`
            },
            params: {
                category,
                subscription
            }
        });
        res.status(200).json(response.data);
    } catch (error) {
        console.error('Error fetching shops:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/cart/addToCart', authenticateToken, async (req, res) => {
    try {
        const { productId, quantity, selectedVariantId, selectedAddOns, totalAmount } = req.body;
        const token = req.headers.authorization; // Assuming the token is sent in the Authorization header

        // Log the incoming request payload
        console.log("Incoming request payload:", req.body);

        // Validate totalAmount
        if (typeof totalAmount !== 'number' || isNaN(totalAmount)) {
            return res.status(400).json({ message: 'Invalid totalAmount' });
        }

        // Implement your add to cart logic here
        // For now, let's just send a success response

        res.status(200).json({
            message: "Product added to cart successfully",
            cart: {
                _id: "67267ad6ea518e41823d7228",
                userId: "672663706382667301018af4",
                items: [
                    {
                        productId,
                        quantity,
                        selectedVariantId,
                        selectedAddOns,
                        price: totalAmount,
                        _id: "6726a13aea518e41823d728b"
                    }
                ],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                __v: 8
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});


// Reduce quantity endpoint
router.post('/cart/reduceQuantity', authenticateToken, async (req, res) => {
    try {
        const { productId, quantity, selectedVariantId, selectedAddOns, price } = req.body;
        const token = req.headers.authorization; // Assuming the token is sent in the Authorization header

        // Implement your reduce quantity logic here
        // For now, let's just send a success response

        res.status(200).json({
            message: "Product quantity reduced successfully",
            cart: {
                _id: "67267ad6ea518e41823d7228",
                userId: "672663706382667301018af4",
                items: [
                    {
                        productId,
                        quantity,
                        selectedVariantId,
                        selectedAddOns,
                        price,
                        _id: "6726a13aea518e41823d728b"
                    }
                ],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                __v: 8
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
