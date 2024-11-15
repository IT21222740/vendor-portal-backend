const express = require("express");
const dotenv = require("dotenv").config();
const connectDB = require("./config/dbConnection");
const cors = require("cors"); // Add this line to import the cors package

connectDB();
const app = express();

const port = process.env.PORT || 5000;

// Define your allowed domain
const allowedDomain = "http://localhost:5173";

// Set up CORS options
const corsOptions = {
  origin: allowedDomain, // Allow only this domain
  methods: ["GET", "POST", "PUT", "DELETE"], // Specify allowed HTTP methods
  allowedHeaders: ["Content-Type", "Authorization"], // Allow specific headers
};

// Apply CORS middleware with the defined options
app.use(cors(corsOptions));

app.use(express.json());
app.use("/api/products", require("./routes/productRoutes"));

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
