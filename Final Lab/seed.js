const mongoose = require('mongoose');
const Product = require('./models/Product');
const User = require('./models/User');

const baseProducts = [
  { name: 'Classic Tailored Shirt', price: 29.99, category: 'Shirts', rating: 4.5, stock: 20, isOnSale: true },
  { name: 'Premium Suit Jacket', price: 119.99, category: 'Suits', rating: 4.8, stock: 8, isOnSale: true },
  { name: 'Custom Formal Trousers', price: 49.99, category: 'Trousers', rating: 4.3, stock: 14, isOnSale: false },
  { name: 'Silk Party Blouse', price: 39.99, category: 'Blouses', rating: 4.6, stock: 12, isOnSale: true },
  { name: 'Embroidered Waistcoat', price: 64.99, category: 'Vests', rating: 4.7, stock: 10, isOnSale: true },
  { name: 'Linen Summer Suit', price: 99.99, category: 'Suits', rating: 4.4, stock: 6, isOnSale: true },
  { name: 'Denim Tailored Jacket', price: 54.99, category: 'Jackets', rating: 4.2, stock: 16, isOnSale: false },
  { name: 'Stretch Chino Pants', price: 34.99, category: 'Trousers', rating: 4.1, stock: 18, isOnSale: true },
  { name: 'Luxury Evening Gown', price: 149.99, category: 'Gowns', rating: 4.9, stock: 5, isOnSale: true },
  { name: 'Oxford Cotton Shirt', price: 27.99, category: 'Shirts', rating: 4.0, stock: 22, isOnSale: true },
  { name: 'Wool Blend Blazer', price: 89.99, category: 'Jackets', rating: 4.5, stock: 11, isOnSale: true },
  { name: 'Pleated Dress Pants', price: 44.99, category: 'Trousers', rating: 4.2, stock: 15, isOnSale: true },
  { name: 'Velvet Dinner Jacket', price: 129.99, category: 'Jackets', rating: 4.7, stock: 7, isOnSale: true },
  { name: 'Casual Linen Shirt', price: 32.99, category: 'Shirts', rating: 4.1, stock: 19, isOnSale: true },
  { name: 'Slim Fit Suit Pants', price: 59.99, category: 'Trousers', rating: 4.4, stock: 13, isOnSale: true },
  { name: 'Floral Print Blouse', price: 36.99, category: 'Blouses', rating: 4.3, stock: 14, isOnSale: true },
  { name: 'Double-Breasted Coat', price: 139.99, category: 'Jackets', rating: 4.6, stock: 6, isOnSale: true },
  { name: 'Cotton Polo Shirt', price: 24.99, category: 'Shirts', rating: 3.9, stock: 25, isOnSale: true },
  { name: 'Tuxedo Shirt', price: 42.99, category: 'Shirts', rating: 4.5, stock: 12, isOnSale: true },
  { name: 'Bridal Satin Gown', price: 199.99, category: 'Gowns', rating: 4.9, stock: 4, isOnSale: true },
  { name: 'Cocktail Dress', price: 79.99, category: 'Gowns', rating: 4.4, stock: 9, isOnSale: true },
  { name: 'Knit Sweater Vest', price: 38.99, category: 'Vests', rating: 4.0, stock: 17, isOnSale: true },
  { name: 'Herringbone Suit', price: 159.99, category: 'Suits', rating: 4.8, stock: 5, isOnSale: true },
  { name: 'Corduroy Trousers', price: 47.99, category: 'Trousers', rating: 4.1, stock: 16, isOnSale: false },
  { name: 'Seersucker Summer Jacket', price: 74.99, category: 'Jackets', rating: 4.3, stock: 10, isOnSale: true }
];

mongoose.connect('mongodb://localhost:27017/ecommerce', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(async () => {
  console.log('Connected to MongoDB for seeding');

  await Product.deleteMany({});
  await User.deleteMany({});

  const products = baseProducts.map((product) => ({
    ...product,
    image: '/uploads/default-product.svg'
  }));

  await Product.insertMany(products);
  const onSaleCount = products.filter((p) => p.isOnSale).length;
  console.log(`Product seed data inserted successfully (${onSaleCount} on-sale items).`);

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
