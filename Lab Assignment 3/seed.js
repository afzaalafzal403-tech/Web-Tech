const mongoose = require('mongoose');
const Product = require('./models/Product');
const User = require('./models/User');

mongoose.connect('mongodb://localhost:27017/ecommerce', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(async () => {
  console.log('Connected to MongoDB for seeding');
  
  // Clear existing data
  await Product.deleteMany({});
  await User.deleteMany({});
  
  // Seed Products
  await Product.insertMany([
    {
      name: 'Classic Tailored Shirt',
      price: 29.99,
      category: 'Shirts',
      rating: 4.5,
      stock: 20,
      image: '/uploads/default-product.svg'
    },
    {
      name: 'Premium Suit Jacket',
      price: 119.99,
      category: 'Suits',
      rating: 4.8,
      stock: 8,
      image: '/uploads/default-product.svg'
    },
    {
      name: 'Custom Formal Trousers',
      price: 49.99,
      category: 'Trousers',
      rating: 4.3,
      stock: 14,
      image: '/uploads/default-product.svg'
    },
    {
      name: 'Silk Party Blouse',
      price: 39.99,
      category: 'Blouses',
      rating: 4.6,
      stock: 12,
      image: '/uploads/default-product.svg'
    },
    {
      name: 'Embroidered Waistcoat',
      price: 64.99,
      category: 'Vests',
      rating: 4.7,
      stock: 10,
      image: '/uploads/default-product.svg'
    },
    {
      name: 'Linen Summer Suit',
      price: 99.99,
      category: 'Suits',
      rating: 4.4,
      stock: 6,
      image: '/uploads/default-product.svg'
    },
    {
      name: 'Denim Tailored Jacket',
      price: 54.99,
      category: 'Jackets',
      rating: 4.2,
      stock: 16,
      image: '/uploads/default-product.svg'
    },
    {
      name: 'Stretch Chino Pants',
      price: 34.99,
      category: 'Trousers',
      rating: 4.1,
      stock: 18,
      image: '/uploads/default-product.svg'
    },
    {
      name: 'Luxury Evening Gown',
      price: 149.99,
      category: 'Gowns',
      rating: 4.9,
      stock: 5,
      image: '/uploads/default-product.svg'
    }
  ]);
  console.log('Product seed data inserted successfully');
  
  // Seed Users (Admin and Customers)
  const users = [
    {
      name: 'Admin User',
      email: 'admin@tailorpro.com',
      password: 'admin123',
      role: 'admin'
    },
    {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      role: 'customer'
    },
    {
      name: 'Jane Smith',
      email: 'jane@example.com',
      password: 'password123',
      role: 'customer'
    }
  ];

  for (const userData of users) {
    const user = new User(userData);
    await user.save();
  }
  console.log('User seed data inserted successfully');
  console.log('\n--- TEST CREDENTIALS ---');
  console.log('Admin Email: admin@tailorpro.com');
  console.log('Admin Password: admin123');
  console.log('\nCustomer 1 Email: john@example.com');
  console.log('Customer 1 Password: password123');
  console.log('\nCustomer 2 Email: jane@example.com');
  console.log('Customer 2 Password: password123');
  console.log('------------------------\n');
  mongoose.connection.close();
})
.catch(err => console.error('Seed error:', err));
