const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Routes
const userRoutes = require('./routes/user');
app.use('/api/v1/user', userRoutes);

// Start server
const PORT = process.env.PORT || 8086;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
