// server/server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const sequelize = require("./config/db");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Static uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Import routes
const authRoutes = require("./routes/auth");
const pdfRoutes = require("./routes/pdfs");
const highlightRoutes = require("./routes/highlights");

// Use routes
app.use("/api/auth", authRoutes);
app.use("/api/pdfs", pdfRoutes);
app.use("/api/highlights", highlightRoutes);

// Import models (associations set hone ke liye)
require("./models/User");
require("./models/PDFFile");
require("./models/Highlight");

// Sync DB and start server
const PORT = process.env.PORT || 5000;

sequelize
  .authenticate()
  .then(() => console.log("DB connected"))
  .catch((err) => console.error("DB connection error", err));

sequelize
  .sync({ alter: true }) // Dev ke liye safe
  .then(() => {
    console.log("DB synced");
    app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
  })
  .catch((err) => {
    console.error("Sync error:", err);
  });
