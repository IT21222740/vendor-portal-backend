const express = require("express");
const dotenv = require("dotenv").config();
const connectDB = require("./config/dbConnection");

connectDB();
const app = express();

const port = process.env.PORT || 5000;

app.use(express.json());

app.use("/api/products", require("./routes/productRoutes"));

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
