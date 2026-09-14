const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const db = new sqlite3.Database("./cloudops.db", (err) => {
  if (err) {
    console.error("Database connection error:", err.message);
  } else {
    console.log("Connected to SQLite database");
  }
});

db.run(`
  CREATE TABLE IF NOT EXISTS tickets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    priority TEXT DEFAULT 'Medium',
    status TEXT DEFAULT 'Open',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

app.get("/", (req, res) => {
  res.send("CloudOps Backend is Running");
});

app.get("/api/tickets", (req, res) => {
  db.all("SELECT * FROM tickets ORDER BY id DESC", [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

app.post("/api/tickets", (req, res) => {
  const { title, description, priority } = req.body;

  if (!title) {
    return res.status(400).json({ error: "Title is required" });
  }

  const sql = `
    INSERT INTO tickets (title, description, priority)
    VALUES (?, ?, ?)
  `;

  db.run(
    sql,
    [title, description || "", priority || "Medium"],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.status(201).json({
        id: this.lastID,
        title,
        description: description || "",
        priority: priority || "Medium",
        status: "Open"
      });
    }
  );
});
app.put("/api/tickets/:id", (req, res) => {
  const { id } = req.params;
  const { title, description, priority, status } = req.body;

  const sql = `
    UPDATE tickets
    SET title = ?, description = ?, priority = ?, status = ?
    WHERE id = ?
  `;

  db.run(
    sql,
    [
      title,
      description || "",
      priority || "Medium",
      status || "Open",
      id
    ],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: "Ticket not found" });
      }

      res.json({
        message: "Ticket updated successfully"
      });
    }
  );
});

app.delete("/api/tickets/:id", (req, res) => {
  const { id } = req.params;

  db.run(
    "DELETE FROM tickets WHERE id = ?",
    [id],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: "Ticket not found" });
      }

      res.json({
        message: "Ticket deleted successfully"
      });
    }
  );
});app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    service: "cloudops-backend"
  });
});

app.listen(PORT, () => {
  console.log(`CloudOps backend running on http://localhost:${PORT}`);
});