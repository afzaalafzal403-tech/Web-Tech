const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const multer = require('multer');
const methodOverride = require('method-override');
const bcryptjs = require('bcryptjs');
const Product = require('./models/Product');
const User = require('./models/User');

const app = express();
const uploadDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

mongoose.connect('mongodb://localhost:27017/ecommerce', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use('/uploads', express.static(uploadDir));
app.use(express.static(path.join(__dirname, 'public')));

// Session configuration with MongoDB store
app.use(session({
  secret: 'tailorpro-admin-secret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: 'mongodb://localhost:27017/ecommerce',
    touchAfter: 24 * 3600 // lazy session update
  }),
  cookie: {
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Flash messages middleware
app.use(flash());

// Make user and flash messages available to all views
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.messages = {
    success: req.flash('success'),
    error: req.flash('error'),
    info: req.flash('info')
  };
  next();
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'public', 'uploads'));
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const safeName = file.originalname.replace(/\s+/g, '-');
    cb(null, `${timestamp}-${safeName}`);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed.'), false);
    }
    cb(null, true);
  }
});

// Middleware: Check if user is logged in
function isLoggedIn(req, res, next) {
  if (req.session.user) {
    return next();
  }
  req.flash('error', 'Please log in to continue');
  return res.redirect('/login');
}

// Middleware: Check if user is admin
function isAdmin(req, res, next) {
  if (req.session.user && req.session.user.role === 'admin') {
    return next();
  }
  req.flash('error', 'Access Denied. Only admins can access this area.');
  return res.redirect('/');
}

// Middleware: Check if user is already logged in (for auth pages)
function isNotLoggedIn(req, res, next) {
  if (!req.session.user) {
    return next();
  }
  return res.redirect('/products');
}

app.get('/', (req, res) => {
  res.redirect('/products');
});

// Customer Registration
app.get('/register', isNotLoggedIn, (req, res) => {
  res.render('auth/register');
});

app.post('/register', isNotLoggedIn, async (req, res) => {
  const { name, email, password, passwordConfirm } = req.body;

  try {
    // Validation
    if (!name || !email || !password || !passwordConfirm) {
      req.flash('error', 'Please provide all required fields');
      return res.redirect('/register');
    }

    if (password !== passwordConfirm) {
      req.flash('error', 'Passwords do not match');
      return res.redirect('/register');
    }

    if (password.length < 6) {
      req.flash('error', 'Password must be at least 6 characters');
      return res.redirect('/register');
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      req.flash('error', 'Email is already in use');
      return res.redirect('/register');
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      password,
      role: 'customer'
    });

    req.session.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    req.flash('success', `Welcome ${name}! Your account has been created.`);
    return res.redirect('/products');
  } catch (err) {
    console.error(err);
    req.flash('error', 'An error occurred during registration');
    return res.redirect('/register');
  }
});

// Customer Login
app.get('/login', isNotLoggedIn, (req, res) => {
  res.render('auth/login');
});

app.post('/login', isNotLoggedIn, async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      req.flash('error', 'Please provide email and password');
      return res.redirect('/login');
    }

    // Get user with password field
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      req.flash('error', 'Invalid email or password');
      return res.redirect('/login');
    }

    // Compare password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      req.flash('error', 'Invalid email or password');
      return res.redirect('/login');
    }

    // Store user in session
    req.session.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    req.flash('success', `Welcome back, ${user.name}!`);
    return res.redirect('/products');
  } catch (err) {
    console.error(err);
    req.flash('error', 'An error occurred during login');
    return res.redirect('/login');
  }
});

// Logout
app.get('/logout', (req, res) => {
  req.flash('success', 'You have been logged out successfully');
  req.session.destroy((err) => {
    if (err) {
      console.error(err);
    }
    res.redirect('/products');
  });
});

// User Profile (for logged-in users)
app.get('/profile', isLoggedIn, async (req, res) => {
  try {
    const user = await User.findById(req.session.user.id);
    res.render('auth/profile', { user });
  } catch (err) {
    console.error(err);
    req.flash('error', 'An error occurred');
    res.redirect('/products');
  }
});

// Checkout page protected by authentication
app.get('/checkout', isLoggedIn, (req, res) => {
  res.render('checkout');
});

app.get('/products', async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = 6;
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
    const categories = await Product.distinct('category');

    res.render('products/index', {
      products,
      currentPage: page,
      totalPages,
      search: req.query.search || '',
      category: req.query.category || '',
      minPrice: req.query.minPrice || '',
      maxPrice: req.query.maxPrice || '',
      categories
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Admin Login
app.get('/admin/login', (req, res) => {
  // If already logged in as admin, redirect to dashboard
  if (req.session.user && req.session.user.role === 'admin') {
    return res.redirect('/admin/dashboard');
  }

  res.render('admin/login');
});

app.post('/admin/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      req.flash('error', 'Please provide email and password');
      return res.redirect('/admin/login');
    }

    // Get user with password field
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      req.flash('error', 'Invalid email or password');
      return res.redirect('/admin/login');
    }

    // Check if user is admin
    if (user.role !== 'admin') {
      req.flash('error', 'Access Denied. This account is not an admin account.');
      return res.redirect('/admin/login');
    }

    // Compare password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      req.flash('error', 'Invalid email or password');
      return res.redirect('/admin/login');
    }

    // Store user in session
    req.session.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    req.flash('success', `Welcome back, Admin ${user.name}!`);
    return res.redirect('/admin/dashboard');
  } catch (err) {
    console.error(err);
    req.flash('error', 'An error occurred during login');
    return res.redirect('/admin/login');
  }
});

// Admin Logout
app.get('/admin/logout', (req, res) => {
  req.flash('success', 'You have been logged out successfully');
  req.session.destroy((err) => {
    if (err) {
      console.error(err);
    }
    res.redirect('/admin/login');
  });
});

app.use('/admin', isAdmin);

app.get('/admin/dashboard', async (req, res) => {
  try {
    const products = await Product.find({}).sort({ category: 1, name: 1 });
    res.render('admin/dashboard', { products });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

app.get('/admin/products/new', (req, res) => {
  res.render('admin/form', {
    title: 'Add New Product',
    action: '/admin/products',
    method: 'POST',
    product: {
      name: '',
      price: '',
      category: '',
      rating: 0,
      stock: '',
      image: ''
    },
    error: null
  });
});

app.post('/admin/products', upload.single('image'), async (req, res) => {
  const { name, price, category, rating, stock } = req.body;
  const imagePath = req.file ? `/uploads/${req.file.filename}` : '/uploads/default-product.svg';

  if (!name || !price || !category || !stock) {
    return res.render('admin/form', {
      title: 'Add New Product',
      action: '/admin/products',
      method: 'POST',
      product: { name, price, category, rating, stock, image: '' },
      error: 'Name, price, category, and stock are required.'
    });
  }

  try {
    await Product.create({
      name,
      price: parseFloat(price),
      category,
      rating: Number(rating || 0),
      stock: parseInt(stock, 10),
      image: imagePath
    });
    res.redirect('/admin/dashboard');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

app.get('/admin/products/:id/edit', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.redirect('/admin/dashboard');
    }

    res.render('admin/form', {
      title: 'Edit Product',
      action: `/admin/products/${product._id}?_method=PUT`,
      method: 'POST',
      product,
      error: null
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

app.put('/admin/products/:id', upload.single('image'), async (req, res) => {
  const { name, price, category, rating, stock } = req.body;
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.redirect('/admin/dashboard');
    }

    if (!name || !price || !category || !stock) {
      return res.render('admin/form', {
        title: 'Edit Product',
        action: `/admin/products/${product._id}?_method=PUT`,
        method: 'POST',
        product: { ...product.toObject(), name, price, category, rating, stock, image: product.image },
        error: 'Name, price, category, and stock are required.'
      });
    }

    product.name = name;
    product.price = parseFloat(price);
    product.category = category;
    product.rating = Number(rating || 0);
    product.stock = parseInt(stock, 10);
    if (req.file) {
      product.image = `/uploads/${req.file.filename}`;
    }
    await product.save();
    res.redirect('/admin/dashboard');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

app.delete('/admin/products/:id', async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.redirect('/admin/dashboard');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
