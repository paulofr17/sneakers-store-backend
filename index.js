require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const port = Number(process.env.PORT) || 8080;
const Multer = require("multer");

const userRouter = require("./src/app/user/user.router");
const productRouter = require("./src/app/products/product.router");
const productVariantRouter = require("./src/app/product_variant/product_variant.router");
const productStockRouter = require("./src/app/product_stock/product_stock.router");
const cartRouter = require("./src/app/cart/cart.router");
const orderRouter = require("./src/app/order/order.router");
const sizeRouter = require("./src/app/size/size.router");
const colorRouter = require("./src/app/color/color.router");
const categoryRouter = require("./src/app/category/category.router");
const dashboardRouter = require("./src/app/dashboard/dashboard.router");

const multer = Multer({
  storage: Multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // No larger than 5mb, change as you need
  },
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(multer.any());

app.use("/api/users", userRouter);
app.use("/api/products", productRouter);
app.use("/api/products-variants", productVariantRouter);
app.use("/api/stock", productStockRouter);
app.use("/api/carts", cartRouter);
app.use("/api/orders", orderRouter);
app.use("/api/sizes", sizeRouter);
app.use("/api/colors", colorRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/dashboard", dashboardRouter);

// Allow Cross Origin requests
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

app.listen(port);
