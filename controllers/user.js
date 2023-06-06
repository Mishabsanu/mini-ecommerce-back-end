const { User, validate } = require("../Models/user");
const bcrypt = require("bcrypt");
var Loginvalidate = require("../utils/validate");
const Book = require("../Models/Book");
const mongoose = require("mongoose");
const TokenBlacklist = require('../Models/TokenBlocklist')

module.exports = {
  userSignup: async (req, res) => {
    try {
      const { error } = validate(req.body);
      if (error)
        return res.status(400).send({ message: error.details[0].message });

      const user = await User.findOne({ email: req.body.email });

      if (user)
        return res
          .status(409)
          .send({ message: "User with given email already Exist!" });

      const salt = await bcrypt.genSalt(Number(process.env.SALT));
      const hashPassword = await bcrypt.hash(req.body.password, salt);

      await new User({ ...req.body, password: hashPassword }).save();
      res.status(201).send({ message: "User created successfully" });
    } catch (error) {
      res.status(500).send({ message: "Internal Server Error" + error });
    }
  },
  userLogin: async (req, res) => {
    try {
      var { error } = Loginvalidate(req.body);
      if (error)
        return res.status(400).send({ message: error.details[0].message });

      var user = await User.findOne({ email: req.body.email });
      if (!user)
        return res.status(401).send({ message: "Invalid Email or Password" });

      var validPassword = await bcrypt.compare(
        req.body.password,
        user.password
      );
      if (!validPassword)
        return res.status(401).send({ message: "Invalid Emailor Password" });

      var token = user.generateAuthToken();

      res.status(200).json({ token, user });
    } catch (error) {
      res.status(500).send({ message: "Internal Server Error" + error });
    }
  },
  addBook: async (req, res) => {
    try {
      const BookExists = await Book.findOne({
        title: req.body.title,
      });

      if (BookExists) {
        return res.status(400).json({ message: "Book already exists" });
      }
      const caseSensitiveExists = await Book.findOne({
        title: {
          $regex: new RegExp("^" + req.body.title + "$", "i"),
        },
      });

      if (caseSensitiveExists) {
        return res.status(400).json({ message: "Book already exists" });
      }

      const bookdata = await Book(req.body).save();
      res.json({ bookdata, status: true });
    } catch (error) {
      res.status(500).send({ message: "Internal Server Error" + error });
    }
  },

  getAllBooks: async (req, res) => {
    try {
      const books = await Book.find().sort("-createdAt");

      res.json(books);
    } catch (error) {
      res.status(500).send({ message: "Internal Server Error" + error });
    }
  },
  addToCart: async (req, res) => {
    console.log(req.body, "body");
    console.log(req.params.id, "userId");
    try {
      const userId = req.params.id;
      console.log(userId, "userId");
      const itemId = new mongoose.Types.ObjectId(req.body.item);
      const quantity = req.body.quantity;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).send({ message: "User not found" });
      }
      if (!user.cart) {
        user.cart = [];
      }

      const cartItem = {
        item: itemId,
        quantity: quantity || 1,
      };
      user.cart.push(cartItem);

      await user.save();

      res.status(200).send({ message: "Cart added successfully" });
    } catch (error) {
      res.status(500).send({ message: "Internal Server Error" + error });
    }
  },

  getAllCartItems: async (req, res) => {
    try {
      const cartItems = await User.find()
        .sort("-createdAt")
        .populate("cart.item");

      res.json(cartItems);
    } catch (error) {
      res.status(500).send({ message: "Internal Server Error" + error });
    }
  },
  removeCartItem: async (req, res) => {
    try {
      const userId = req.params.id;
      const itemId = req.body.itemId;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).send({ message: "User not found" });
      }

      const itemIndex = user.cart.findIndex(
        (item) => item.item.toString() === itemId
      );
      if (itemIndex === -1) {
        return res.status(404).send({ message: "Item not found in the cart" });
      }

      user.cart.splice(itemIndex, 1);

      await user.save();

      res.status(200).send({ message: "Item removed from cart successfully" });
    } catch (error) {
      res.status(500).send({ message: "Internal Server Error" + error });
    }
  },

  userLogout: async (req, res) => {
    try {
      const token = req.headers.authorization; 
  
      const blacklistedToken = await TokenBlacklist.findOne({ token });
  
      if (blacklistedToken) {
        
        return res.status(401).send({ message: 'Token is invalid or expired' });
      }
  
      
      const revokedToken = new TokenBlacklist({ token });
      await revokedToken.save();
  
      res.status(200).send({ message: 'Logout successful' });
    } catch (error) {
      res.status(500).send({ message: 'Internal Server Error'+error });
    }
  },
};
