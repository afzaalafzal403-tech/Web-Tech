const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const session = require('express-session');
const multer = require('multer');
const methodOverride = require('method-override');
const Product = require('./models/Product');

const app = express();
const ADMIN_PASSWORD = 'admin123';

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
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'tailorpro-admin-secret',
  resave: false,
  saveUninitialized: false
}));

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

function requireAdmin(req, res, next) {
  if (req.session && req.session.isAdmin) {
    return next();
  }
  if (req.path === '/login' || req.path === '/logout') {
    return next();
  }
  return res.redirect('/admin/login');
}

app.get('/', (req, res) => {
  res.redirect('/products');
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

app.use('/admin', requireAdmin);

app.get('/admin/login', (req, res) => {
  res.render('admin/login', { error: null });
});

app.post('/admin/login', (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    req.session.isAdmin = true;
    return res.redirect('/admin/dashboard');
  }
  res.render('admin/login', { error: 'Invalid password. Please try again.' });
});

app.get('/admin/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/admin/login');
  });
});

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
        product: { ...product.toObject(), name, price, category, rating, stock },
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
