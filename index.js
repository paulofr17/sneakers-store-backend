require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const port = parseInt(process.env.PORT) || 8080;

const userRouter = require("./src/app/user/user.router");
const productRouter = require("./src/app/product/product.router");
const productItemRouter = require("./src/app/productItem/product_item.router");
const cartRouter = require("./src/app/cart/cart.router");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/users", userRouter);
app.use("/api/product", productRouter);
app.use("/api/product_item", productItemRouter);
app.use("/api/cart", cartRouter);

// Allow Cross Origin requests
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

app.listen(port, function () {
  console.log(`Server listening on port: ${port}`);
});
