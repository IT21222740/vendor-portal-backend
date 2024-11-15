const Product = require("../models/productModel");
const path = require("path");
const multer = require("multer");
require("dotenv").config(); // Load environment variables
const fs = require("fs");

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

    // Modify each product to include Base64-encoded image data
    const productsWithImages = await Promise.all(
      products.map(async (product) => {
        const images = await Promise.all(
          product.images.map((imageUrl) => {
            const filePath = path.resolve(
              __dirname,
              "../",
              imageUrl.replace(`${process.env.BASE_URL}/`, "")
            );
            return new Promise((resolve, reject) => {
              fs.readFile(filePath, (err, data) => {
                if (err) {
                  console.error(`Error reading file ${filePath}:`, err);
                  resolve(null); // Resolve with null if an error occurs
                } else {
                  resolve(`data:image/png;base64,${data.toString("base64")}`);
                }
              });
            });
          })
        );

        return { ...product.toObject(), images };
      })
    );

    res.status(200).json(productsWithImages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching products", error });
  }
};
// Controller to handle deleting a product
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the product by ID
    const product = await Product.findOne({ sku: id });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Delete each associated image file
    await Promise.all(
      product.images.map((imageUrl) => {
        const filePath = path.resolve(
          __dirname,
          "../",
          imageUrl.replace(`${process.env.BASE_URL}/`, "")
        );
        return new Promise((resolve, reject) => {
          fs.unlink(filePath, (err) => {
            if (err) {
              console.error(`Error deleting file ${filePath}:`, err);
              resolve(null); // Resolve to ignore errors for missing files
            } else {
              resolve();
            }
          });
        });
      })
    );

    // Remove the product from the database
    await product.deleteOne();

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting product", error });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { sku, name, qty, description } = req.body;

    // Find the existing product by ID
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    console.log("Files uploaded:", req.files);

    // If new images are uploaded, process them
    let imageUrls = product.images; // Keep existing images if no new images are uploaded

    if (req.files && req.files.length > 0) {
      // Delete old images from the server
      await Promise.all(
        product.images.map((imageUrl) => {
          const filePath = path.resolve(
            __dirname,
            "../",
            imageUrl.replace(`${process.env.BASE_URL}/`, "")
          );
          return new Promise((resolve, reject) => {
            fs.unlink(filePath, (err) => {
              if (err) {
                console.error(`Error deleting file ${filePath}:`, err);
                resolve(null); // Ignore errors for missing files
              } else {
                resolve();
              }
            });
          });
        })
      );

      // Process and store new images
      imageUrls = req.files.map(
        (file) =>
          `${process.env.BASE_URL}/${process.env.UPLOAD_DIR}${file.filename}`
      );
    }

    // Update the product details with the new data
    product.sku = sku;
    product.name = name;
    product.qty = qty;
    product.description = description;
    product.images = imageUrls; // Update the images

    // Save the updated product to the database
    await product.save();

    res.status(200).json({ message: "Product updated successfully", product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating product", error });
  }
};

// Export the updateProduct controller function and multer middleware
module.exports = {
  addProduct,
  getProducts,
  deleteProduct,
  updateProduct,
  upload: upload.array("images"), // Ensure 'images' matches the client-side field name
};
