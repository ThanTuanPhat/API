const express = require("express");
const router = express.Router();

var indexRouter = require("./index");
var usersRouter = require("./users");
var productsRouter = require("./products");
var cartsRouter = require("./carts");
var adminsRouter = require("./admins");
var categoriesRouter = require("./categories");
var preservesRouter = require("./preserves");
var saleRouter = require("./sale");
var addressesRouter = require("./addresses");
var notificationRouter = require("./notifications");
var oderRouter = require("./oder");
var commentRouter = require("./comment");

router.use("/users", usersRouter);
router.use("/", indexRouter);
router.use("/products", productsRouter);
router.use("/carts", cartsRouter);
router.use("/admins", adminsRouter);
router.use("/categories", categoriesRouter);
router.use("/preserves", preservesRouter);
router.use("/addresses", addressesRouter);
router.use("/sale", saleRouter);
router.use("/oder", oderRouter);
router.use("/notifications", notificationRouter);
router.use("/comment", commentRouter);

module.exports = router;