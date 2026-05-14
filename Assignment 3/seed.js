const mongoose = require('mongoose');
const Product = require('./models/Product');

mongoose.connect('mongodb://localhost:27017/ecommerce', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

const sampleProducts = [
  { name: 'Men\'s Tailored Suit', price: 450, category: 'Formal', rating: 4.7, stock: 12 },
  { name: 'Women\'s Evening Gown', price: 520, category: 'Bridal', rating: 4.8, stock: 7 },
  { name: 'Custom Kurta Set', price: 120, category: 'Ethnic', rating: 4.5, stock: 18 },
  { name: 'Embroidered Sherwani', price: 650, category: 'Bridal', rating: 4.9, stock: 5 },
  { name: 'Formal Dress Shirt', price: 75, category: 'Formal', rating: 4.3, stock: 24 },
  { name: 'Slim Fit Trousers', price: 95, category: 'Formal', rating: 4.2, stock: 20 },
  { name: 'Casual Linen Shirt', price: 85, category: 'Casual', rating: 4.4, stock: 30 },
  { name: 'Denim Jacket', price: 140, category: 'Casual', rating: 4.6, stock: 14 },
  { name: 'Satin Party Dress', price: 210, category: 'Bridal', rating: 4.5, stock: 10 },
  { name: 'Kids\' Party Suit', price: 180, category: 'Formal', rating: 4.4, stock: 11 },
  { name: 'Tailored Waistcoat', price: 110, category: 'Formal', rating: 4.3, stock: 27 },
  { name: 'Silk Saree Stitching', price: 280, category: 'Bridal', rating: 4.7, stock: 8 },
  { name: 'Cotton Shalwar Kameez', price: 95, category: 'Ethnic', rating: 4.1, stock: 22 },
  { name: 'Wedding Guest Dress', price: 240, category: 'Bridal', rating: 4.6, stock: 9 },
  { name: 'Summer Kurta', price: 105, category: 'Ethnic', rating: 4.2, stock: 26 },
  { name: 'Leather Jacket Repair', price: 75, category: 'Alteration', rating: 4.0, stock: 16 },
  { name: 'Jeans Alteration', price: 40, category: 'Alteration', rating: 4.1, stock: 45 },
  { name: 'Sleeve Shortening', price: 35, category: 'Alteration', rating: 4.3, stock: 50 },
  { name: 'Custom Blouse', price: 115, category: 'Formal', rating: 4.5, stock: 21 },
  { name: 'Fabric Embellishment', price: 130, category: 'Bridal', rating: 4.6, stock: 13 },
  { name: 'Chiffon Gown', price: 260, category: 'Bridal', rating: 4.4, stock: 6 },
  { name: 'Corduroy Trousers', price: 90, category: 'Casual', rating: 4.0, stock: 29 },
  { name: 'Men\'s Nehru Jacket', price: 160, category: 'Ethnic', rating: 4.5, stock: 19 },
  { name: 'Pleated Skirt', price: 70, category: 'Casual', rating: 4.2, stock: 28 },
  { name: 'Formal Pencil Skirt', price: 85, category: 'Formal', rating: 4.3, stock: 17 },
  { name: 'Fabric Measurement Pack', price: 60, category: 'Alteration', rating: 4.1, stock: 34 },
  { name: 'Wedding Suit Alteration', price: 95, category: 'Alteration', rating: 4.4, stock: 14 },
  { name: 'Bridal Dupatta Styling', price: 45, category: 'Bridal', rating: 4.3, stock: 32 },
  { name: 'Mesh Dress Stitching', price: 190, category: 'Formal', rating: 4.5, stock: 8 },
  { name: 'Tailored T-Shirt', price: 55, category: 'Casual', rating: 4.0, stock: 36 },
  { name: 'Alteration Express Service', price: 80, category: 'Alteration', rating: 4.5, stock: 20 }
];

const seedDB = async () => {
  await Product.deleteMany({});
  await Product.insertMany(sampleProducts);
  console.log('Database seeded with sample products');
  mongoose.connection.close();
};

seedDB().catch(err => console.error(err));