const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  producttitle: {
    type: String,
   required: true,
  },
  description: {
    type: String,
   required: true,
  },
  categoryname: {
    type: String,
   required: true,
  },
  price: {
    type: Number,
   required: true,
  },
  discount:{
    type: Number,
   required: true,
  },
  stock:{
    type: Number,
   required: true,
  },
   images: {
    type:Object,
    required: true,
   },
  status: {
    type:Boolean,
    default:true,
   },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
const Product = mongoose.model('Product', productSchema);

module.exports = Product;
