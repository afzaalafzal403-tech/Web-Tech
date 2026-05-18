const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Product = require('../models/Product');
const User = require('../models/User');
const Order = require('../models/Order');
const { verifyToken } = require('../middleware/apiAuth');

// --- PUBLIC ENDPOINTS ---

// GET /api/v1/products - Get all products with pagination and filtering
router.get('/products', async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const query = {};
  if (req.query.search) {
    query.name = { $regex: req.query.search, $options: 'i' };
  }
  if (req.query.category && req.query.category !== '') {
    query.category = req.query.category;
  }
  if (req.query.minPrice || req.query.maxPrice) {
    query.price = {};
    if (req.query.minPrice) {
      query.price.$gte = parseFloat(req.query.minPrice);
    }
    if (req.query.maxPrice) {
      query.price.$lte = parseFloat(req.query.maxPrice);
    }
  }

  try {
    const products = await Product.find(query).skip(skip).limit(limit);
    const totalProducts = await Product.countDocuments(query);
    const totalPages = Math.ceil(totalProducts / limit);

    res.json({
      success: true,
      data: products,
      pagination: {
        totalProducts,
        totalPages,
        currentPage: page,
        limit
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// GET /api/v1/products/:id - Get a single product
router.get('/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    res.json({ success: true, data: product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// POST /api/v1/auth/login - Sign-in and get JWT
router.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Please provide email and password' });
  }

  try {
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // Generate JWT token
    const payload = {
      id: user._id,
      role: user.role
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// --- PROTECTED ENDPOINTS ---

// GET /api/v1/user/profile - Get authenticated user profile
router.get('/user/profile', verifyToken, async (req, res) => {
  try {
    // req.apiUser is set by the verifyToken middleware
    const user = await User.findById(req.apiUser.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    res.json({ success: true, data: user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// POST /api/v1/orders - Submit an order
router.post('/orders', verifyToken, async (req, res) => {
  const { items, shipping } = req.body;

  if (!items || !items.length || !shipping || !shipping.address || !shipping.city || !shipping.state || !shipping.zip) {
    return res.status(400).json({ success: false, error: 'Please provide all required fields including items and complete shipping address.' });
  }

  try {
    let total = 0;
    
    // Validate items and calculate total securely based on database prices (recommended)
    // For simplicity in this lab, we will calculate total from provided items 
    // but a real app would fetch product prices from the database here.
    const orderItems = [];
    
    for (let item of items) {
       const product = await Product.findById(item.product);
       if (!product) {
           return res.status(404).json({ success: false, error: `Product not found: ${item.product}` });
       }
       
       const itemTotal = product.price * item.quantity;
       total += itemTotal;
       
       orderItems.push({
           product: product._id,
           name: product.name,
           price: product.price,
           quantity: item.quantity,
           image: product.image
       });
    }

    const order = await Order.create({
      user: req.apiUser.id,
      items: orderItems,
      total: total,
      shipping
    });

    res.status(201).json({ success: true, data: order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

module.exports = router;
