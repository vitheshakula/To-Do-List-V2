const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config();

const app = express();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.log("❌ MongoDB connection error:", err));

// Task model
const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  completed: { type: Boolean, default: false },
});

const Task = mongoose.model("Task", taskSchema);

// Routes
app.get("/", async (req, res) => {
  const tasks = await Task.find();
  res.render("list", { tasks });
});

app.post("/add", async (req, res) => {
  const { title } = req.body;
  if (title.trim() !== "") {
    await Task.create({ title });
  }
  res.redirect("/");
});

app.post("/delete/:id", async (req, res) => {
  await Task.findByIdAndDelete(req.params.id);
  res.redirect("/");
});

app.post("/toggle/:id", async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (task) {
    task.completed = !task.completed;
    await task.save();
  }
  res.redirect("/");
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
