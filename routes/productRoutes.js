const express = require("express");
const router = express.Router();
const {
  addProduct,
  getProducts,
  upload,
  deleteProduct,
  updateProduct, // Import updateProduct
} = require("../controllers/productController");

// Route to add a new product
router.post("/add", upload, addProduct);

// Route to get all products
router.get("/", getProducts);

// Route to delete a product by ID
router.delete("/delete/:id", deleteProduct);

// Route to update a product by ID
router.put("/update/:id", upload, updateProduct);

module.exports = router;
