const express = require("express");
const mongoose = require("mongoose");
const app = express();

// Replace <password> with your actual MongoDB password
const mongoURI = "mongodb+srv://Vithesh:<your_password>@vithesh.sykdo8s.mongodb.net/todolistDB?retryWrites=true&w=majority&appName=Vithesh";

mongoose.connect(mongoURI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log("MongoDB connection error:", err));

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

// Task Schema
const taskSchema = new mongoose.Schema({
  name: String,
  completed: {
    type: Boolean,
    default: false,
  },
});

const Task = mongoose.model("Task", taskSchema);

// Insert default tasks if empty
(async () => {
  const count = await Task.countDocuments({});
  if (count === 0) {
    await Task.insertMany([
      { name: "Learn DSA" },
      { name: "Learn Node.js" },
      { name: "Learn Express.js" },
      { name: "Learn MongoDB" },
    ]);
  }
})();

// Home Route
app.get("/", async (req, res) => {
  const tasks = await Task.find({});
  res.render("list", { ejes: tasks });
});

// Add Task
app.post("/", async (req, res) => {
  const taskName = req.body.e1e1;
  if (taskName.trim() !== "") {
    await Task.create({ name: taskName });
  }
  res.redirect("/");
});

// Toggle Completion
app.post("/toggle", async (req, res) => {
  const index = req.body.index;
  const tasks = await Task.find({});
  const task = tasks[index];
  if (task) {
    task.completed = !task.completed;
    await task.save();
  }
  res.redirect("/");
});

// Delete Task
app.post("/delete", async (req, res) => {
  const index = req.body.index;
  const tasks = await Task.find({});
  const task = tasks[index];
  if (task) {
    await Task.findByIdAndDelete(task._id);
  }
  res.redirect("/");
});

// Start Server
app.listen(3000, () => {
  console.log("Server started on http://localhost:3000");
});
