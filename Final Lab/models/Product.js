const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  stock: {
    type: Number,
    required: true,
    min: 0
  },
  image: {
    type: String,
    default: '/uploads/default-product.svg'
  },
  isOnSale: {
    type: Boolean,
    default: false
  }
});

productSchema.virtual('imageUrl').get(function() {
  const imagePath = this.image || '/uploads/default-product.svg';
  return imagePath === '/uploads/default-product.png' ? '/uploads/default-product.svg' : imagePath;
});

productSchema.set('toObject', { virtuals: true });
productSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);
