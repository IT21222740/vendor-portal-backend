const express = require("express");
const router = express.Router();
const {
  addProduct,
  getProducts,
  upload,
} = require("../controllers/productController");

router.post("/add", upload, addProduct);
router.get("/", getProducts);

module.exports = router;
