import express from "express";
import bodyParser from "body-parser";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const app = express();
const port = 3000;

app.use(bodyParser.json()); // for parsing application/json

// Mock database for books
let books = [
  {
    title: "Book 1",
    author: "Author 1",
    isbn: "1234567890",
    review: "Great book",
  },
  {
    title: "Book 2",
    author: "Author 2",
    isbn: "0987654321",
    review: "Interesting read",
  },
];

// Mock database for users
let users = [];

const jwtSecret = "your_secret_key"; // You should use an environment variable for production!

// Register User
app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 8);

  const existingUser = users.find((user) => user.username === username);
  if (existingUser) {
    return res.status(400).send("Username already exists");
  }

  const user = { username, password: hashedPassword };
  users.push(user);
  res.status(201).send("User registered successfully");
});

// Login User
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = users.find((user) => user.username === username);

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).send("Invalid username or password");
  }

  const token = jwt.sign({ username: user.username }, jwtSecret, {
    expiresIn: "2h",
  });
  res.json({ token });
});

// Middleware to authenticate JWT tokens
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, jwtSecret, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// Task 1: Get the book list available in the shop
app.get("/books", authenticateToken, async (req, res) => {
  res.json(books);
});

// Task 2: Get the books based on ISBN
app.get("/books/isbn/:isbn", authenticateToken, async (req, res) => {
  const isbn = req.params.isbn;
  const book = books.find((b) => b.isbn === isbn);
  if (book) {
    res.json(book);
  } else {
    res.status(404).send("Book not found");
  }
});

// Task 3: Get all books by Author
app.get("/books/author/:author", authenticateToken, async (req, res) => {
  const author = req.params.author;
  const authorBooks = books.filter((b) => b.author === author);
  res.json(authorBooks);
});

// Task 4: Get all books based on Title
app.get("/books/title/:title", authenticateToken, async (req, res) => {
  const title = req.params.title;
  const titleBooks = books.filter((b) =>
    b.title.toLowerCase().includes(title.toLowerCase())
  );
  res.json(titleBooks);
});

// Task 5: Get book Review
app.get("/books/review/:isbn", authenticateToken, async (req, res) => {
  const isbn = req.params.isbn;
  const book = books.find((b) => b.isbn === isbn);
  if (book) {
    res.send(book.review);
  } else {
    res.status(404).send("Book not found");
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
