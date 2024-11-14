const Product = require("../models/productModel");
const path = require("path");
const multer = require("multer");
require("dotenv").config(); // Load environment variables

// Set up multer storage engine for images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = process.env.UPLOAD_DIR || "uploads/"; // Default to 'uploads/' if not specified
    cb(null, path.resolve(__dirname, "../", uploadDir)); // Use absolute path based on UPLOAD_DIR
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Filename with timestamp
  },
});

const upload = multer({ storage });

// Controller to handle adding a product
const addProduct = async (req, res) => {
  try {
    const { sku, name, qty, description } = req.body;
    console.log(req.files);

    const imageUrls = req.files.map(
      (file) =>
        `${process.env.BASE_URL}/${process.env.UPLOAD_DIR}${file.filename}`
    );

    const newProduct = new Product({
      sku,
      name,
      qty,
      description,
      images: imageUrls,
    });

    await newProduct.save();
    res
      .status(201)
      .json({ message: "Product added successfully", product: newProduct });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error adding product", error });
  }
};

// Controller to handle fetching all products
const getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching products", error });
  }
};

// Export the controller functions
module.exports = {
  addProduct,
  getProducts,
  upload: upload.array("images"),
};
