const verifyToken = require("../middleware/authUser")
const express = require("express");
const {
  userSignup,
  userLogin,
  addBook,
  getAllBooks,
  addToCart,
  getAllCartItems,
  removeCartItem,
  userLogout
} = require("../controllers/user");

const router = express.Router();

router.post("/", userSignup);
router.post("/login", userLogin);
router.post("/addBook",verifyToken, addBook);
router.get("/getAllBooks",verifyToken, getAllBooks);
router.post("/addToCart/:id/:itemId",verifyToken, addToCart);
router.get("/getAllCartItems",verifyToken, getAllCartItems);
router.delete("/removeCartItem/:id",verifyToken, removeCartItem);
router.post("/userLogout", userLogout);

module.exports = router;