import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import bcrypt from "bcrypt";

const app = express();
const port = 4000;

// Update database connection details here
const db = new pg.Client({
  user: "default",
  host: "ep-shrill-smoke-a1t8inbs-pooler.ap-southeast-1.aws.neon.tech",
  database: "verceldb",
  password: "y8octf3OYdki",
  port: 5432,
  ssl: {
    rejectUnauthorized: false, // Disable SSL certificate verification temporarily
  },
});

db.connect();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// CHALLENGE 1: GET All posts
app.get("/posts", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM posts");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: "Error fetching posts" });
  }
});

// CHALLENGE 2: GET a specific post by id
app.get("/posts/:id", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM posts WHERE id = $1", [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Error fetching post" });
  }
});

// CHALLENGE 3: POST a new post
app.post("/posts", async (req, res) => {
  try {
    const { title, content, author, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log(`Hashed password during creation: ${hashedPassword}`);
    const result = await db.query(
      "INSERT INTO posts (title, content, author, password) VALUES ($1, $2, $3, $4) RETURNING *",
      [title, content, author, hashedPassword]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Error creating post" });
  }
});

// CHALLENGE 4: PATCH a post when you just want to update one parameter
app.patch("/posts/:id", async (req, res) => {
  try {
    const { title, content, author, password } = req.body;
    const postResult = await db.query("SELECT * FROM posts WHERE id = $1", [req.params.id]);
    if (postResult.rows.length === 0) {
      return res.status(404).json({ message: "Post not found" });
    }
    const post = postResult.rows[0];
    const passwordMatch = await bcrypt.compare(password, post.password);
    if (!passwordMatch) {
      return res.status(403).json({ message: "Incorrect password" });
    }
    const result = await db.query(
      "UPDATE posts SET title = $1, content = $2, author = $3 WHERE id = $4 RETURNING *",
      [title, content, author, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Error updating post" });
  }
});

// CHALLENGE 5: DELETE a specific post by providing the post id and password
app.delete("/posts/:id", async (req, res) => {
  try {
    const { password } = req.body;
    const postResult = await db.query("SELECT password FROM posts WHERE id = $1", [req.params.id]);
    if (postResult.rows.length === 0) {
      return res.status(404).json({ message: "Post not found" });
    }
    const post = postResult.rows[0];
    const passwordMatch = await bcrypt.compare(password, post.password);
    if (!passwordMatch) {
      return res.status(403).json({ message: "Incorrect password" });
    }
    await db.query("DELETE FROM posts WHERE id = $1", [req.params.id]);
    res.json({ message: "Post deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting post" });
  }
});

app.listen(port, () => {
  console.log(`API is running at http://localhost:${port}`);
});
