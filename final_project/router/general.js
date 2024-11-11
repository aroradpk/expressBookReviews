const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  //Write your code here
  const{username, password} = req.body;
  if(!username || !password){
    return res.status(400).json({message: "username and password are required"})
  }
  const existingUser = users.find(user=> user.username === username);
  if(existingUser){
    return res.status(409).json({message: "User already exists!"})
  }
  users.push({username, password})
  return res.status(201).json({message: "User successfully registered"})
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  //Write your code here
  const booksJson = JSON.stringify(books, null, 4); // 2 spaces for indentation
  
  // Send the JSON string as the response
  return res.status(200).send(booksJson);
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  // Extract ISBN from the request parameters
  const isbn = req.params.isbn;

  // Check if the book with the given ISBN exists
  const book = books[isbn];

  if (book) {
    // If book is found, return the book details
    return res.status(200).json(book);
  } else {
    // If book is not found, return an error message
    return res.status(404).json({ message: "Book not found" });
  }
});

  
// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  // Extract the author from the request parameters
  const author = req.params.author;

  // Filter books by the given author
  const filteredBooks = Object.values(books).filter(book => book.author.toLowerCase() === author.toLowerCase());

  if (filteredBooks.length > 0) {
    // If books are found, return the filtered list
    return res.status(200).json(filteredBooks);
  } else {
    // If no books are found for the author, return a message
    return res.status(404).json({ message: "No books found for this author" });
  }
});


// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  // Extract the title from the request parameters
  const title = req.params.title;

  // Find books that match the given title
  const filteredBooks = Object.values(books).filter(book => book.title.toLowerCase() === title.toLowerCase());

  if (filteredBooks.length > 0) {
    // If books are found, return the filtered list
    return res.status(200).json(filteredBooks);
  } else {
    // If no books are found with the title, return a message
    return res.status(404).json({ message: "No books found with this title" });
  }
});


//  Get book review
public_users.get('/review/:isbn', function (req, res) {
  // Extract ISBN from the request parameters
  const isbn = req.params.isbn;

  // Check if the book with the given ISBN exists
  const book = books[isbn];

  if (book) {
    // If the book is found, return its reviews
    return res.status(200).json(book.reviews);
  } else {
    // If the book is not found, return an error message
    return res.status(404).json({ message: "Book not found" });
  }
});


module.exports.general = public_users;
