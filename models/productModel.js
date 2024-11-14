const mongoose = require("mongoose");

const productShcema = new mongoose.Schema({
  sku: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  qty: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  images: {
    type: [String],
    required: true,
  },
});

const Product = mongoose.model("Product", productShcema);

module.exports = Product;
