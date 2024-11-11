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
  const token = jwt.sign({username}, "fingerprint_customer", {expiresIn: '2h'})
  req.session.token = token;
  return res.status(200).json({message: "Login successful", token})
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;

  if (!review) {
    return res.status(400).json({ message: "Review content is required" });
  }

  try {
    const decoded = jwt.verify(req.session.token, "fingerprint_customer");
    console.log("Decoded token:", decoded);

    const username = decoded.username;

    // Check if the book exists in the database
    if (!books[isbn]) {
      console.log("Book not found:", isbn);
      return res.status(404).json({ message: "Book not found" });
    }

    // Initialize the reviews object if it doesn't exist
    if (!books[isbn].reviews) {
      books[isbn].reviews = {};
    }

    // Add or update the user's review
    books[isbn].reviews[username] = review;

    return res.status(200).json({ message: "Review added/updated successfully", reviews: books[isbn].reviews });
  } catch (err) {
    console.error("Token verification failed:", err);
    return res.status(403).json({ message: "Invalid token" });
  }
});
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;

  try {
    const decoded = jwt.verify(req.session.token, "fingerprint_customer");
    const username = decoded.username;
    if(!books[isbn]){
      return res.status(404).json({message: "Book not found"})
    }
    if(books[isbn].reviews && books[isbn].reviews[username]){
      delete books[isbn].reviews[username];
      return res.status(200).json({message: "Review deleted successfully", reviews: books[isbn].reviews});
    } else{
      return res.status(404).json({message: "Review not found for this user"})
    }
  } catch (error) {
    console.error("Token verification failed:", err);
    return res.status(403).json({ message: "Invalid token" });
  }
})


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
