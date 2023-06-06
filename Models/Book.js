const mongoose = require("mongoose");

const BookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
    },
    description: {
      type: String,
    },
    genre: {
      type: String,
    },
    author: {
      type: String,
    },
    imageUrl: {
      type: String,
    },
    price: {
      type: Number,
    },
    language:{
      type: String,

    }
  },
  {
    timestamps: true,
  }
);

const Book = mongoose.model("Book", BookSchema);
module.exports = Book;
