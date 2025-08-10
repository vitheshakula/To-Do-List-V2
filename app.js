const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const methodOverride = require("method-override");
const app = express();

dotenv.config();

const PORT = process.env.PORT || 3000;
const mongoURI = process.env.MONGO_URI;

if (!mongoURI) {
  console.error("MONGO_URI is not defined in environment variables.");
  process.exit(1);
}

mongoose.connect(mongoURI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(methodOverride("_method"));

const taskSchema = new mongoose.Schema({
  name: { type: String, required: true },
  completed: { type: Boolean, default: false },
  priority: { type: String, enum: ["urgent", "high", "low"], default: "low" }
});

const Task = mongoose.model("Task", taskSchema);

(async () => {
  try {
    const count = await Task.countDocuments({});
    if (count === 0) {
      await Task.insertMany([
        { name: "Learn DSA", priority: "high" },
        { name: "Learn Node.js", priority: "urgent" },
        { name: "Learn Express.js", priority: "high" },
        { name: "Learn MongoDB", priority: "low" }
      ]);
    }
  } catch (err) {
    console.error("Error inserting default tasks:", err);
  }
})();

app.get("/", async (req, res) => {
  const tasks = await Task.find({});
  const message = req.query.message || "";
  res.render("list", { tasks, message });
});

app.post("/", async (req, res) => {
  const { taskName, priority } = req.body;
  if (!taskName || taskName.trim() === "") {
    return res.redirect("/?message=" + encodeURIComponent("Task title cannot be empty!"));
  }
  await Task.create({ name: taskName, priority: priority || "low" });
  res.redirect("/?message=" + encodeURIComponent("Task added successfully!"));
});

app.put("/edit/:id", async (req, res) => {
  const { id } = req.params;
  const { taskName, priority } = req.body;
  if (!taskName || taskName.trim() === "") {
    return res.redirect("/?message=" + encodeURIComponent("Task title cannot be empty!"));
  }
  await Task.findByIdAndUpdate(id, { name: taskName, priority: priority || "low" });
  res.redirect("/?message=" + encodeURIComponent("Task updated successfully!"));
});

app.patch("/toggle/:id", async (req, res) => {
  const { id } = req.params;
  const task = await Task.findById(id);
  if (task) {
    task.completed = !task.completed;
    await task.save();
  }
  res.redirect("/?message=" + encodeURIComponent("Task status updated!"));
});

app.delete("/delete/:id", async (req, res) => {
  await Task.findByIdAndDelete(req.params.id);
  res.redirect("/?message=" + encodeURIComponent("Task deleted successfully!"));
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
