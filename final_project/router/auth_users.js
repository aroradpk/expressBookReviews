const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
  return users.some(user => user.username === username);
}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
  return users.some(user => user.username === username && user.password === password);
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  //Write your code here
  const {username, password} = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }
  if(!isValid(username)){
    return res.status(401).json({message: "Username invalid"})
  }
  if(!authenticatedUser(username, password)){
    return res.status(401).json({message: "Invalid password"})
  }
  const token = jwt.sign({username}, "fingerprint_customer", {expiresIn: '1h'})
  req.session.token = token;
  return res.status(200).json({message: "Login successful", token})
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
  const isbn = req.params.isbn
  const review = req.query.review
  if(!req.session.token){
    return res.status(401).json({message: "user not logged in"})
  }
  const decoded = jwt.verify(req.session.token, "fingerprint_customer");
  console.log("decoded", decoded)
  const username = decoded.username
  if(!books[isbn]){
    return res.status(404).json({message: "Book not found"})
  }
  if(!books[isbn].reviews){
    books[isbn].reviews = {}
  }
  books[isbn].reviews[username] = review
  return res.status(200).json({ message: "Review added/updated successfully", reviews: books[isbn].reviews });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
