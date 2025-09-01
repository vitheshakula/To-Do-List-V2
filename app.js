require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const methodOverride = require("method-override");

const app = express();

// Middleware
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(methodOverride("_method"));

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Schema
const taskSchema = new mongoose.Schema({
  name: String,
  completed: { type: Boolean, default: false },
  priority: { type: String, enum: ["urgent", "high", "low"], default: "low" },
});

const Task = mongoose.model("Task", taskSchema);

// Routes
app.get("/", async (req, res) => {
  try {
    const tasks = await Task.find();
    res.render("list", { tasks, message: "" }); // ✅ message always defined
  } catch (err) {
    res.status(500).send("Error fetching tasks");
  }
});

app.post("/", async (req, res) => {
  const { taskName, priority } = req.body;
  try {
    await Task.create({ name: taskName, priority });
    res.redirect("/");
  } catch (err) {
    res.render("list", { tasks: [], message: "❌ Failed to add task" });
  }
});

app.patch("/toggle/:id", async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    task.completed = !task.completed;
    await task.save();
    res.redirect("/");
  } catch (err) {
    res.render("list", { tasks: [], message: "❌ Failed to toggle task" });
  }
});

app.put("/edit/:id", async (req, res) => {
  const { taskName, priority } = req.body;
  try {
    await Task.findByIdAndUpdate(req.params.id, { name: taskName, priority });
    res.redirect("/");
  } catch (err) {
    res.render("list", { tasks: [], message: "❌ Failed to edit task" });
  }
});

app.delete("/delete/:id", async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.redirect("/");
  } catch (err) {
    res.render("list", { tasks: [], message: "❌ Failed to delete task" });
  }
});

// Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
