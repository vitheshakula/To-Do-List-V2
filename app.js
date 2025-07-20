const express = require("express");
const mongoose = require("mongoose");
const app = express();
const dotenv = require("dotenv");

dotenv.config();

const mongoURI = process.env.MONGO_URI;

mongoose.connect(mongoURI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log("MongoDB connection error:", err));

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

const taskSchema = new mongoose.Schema({
  name: String,
  completed: {
    type: Boolean,
    default: false,
  },
});

const Task = mongoose.model("Task", taskSchema);

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

app.get("/", async (req, res) => {
  const tasks = await Task.find({});
  res.render("list", { ejes: tasks });
});

app.post("/", async (req, res) => {
  const taskName = req.body.e1e1;
  if (taskName.trim() !== "") {
    await Task.create({ name: taskName });
  }
  res.redirect("/");
});

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

app.post("/delete", async (req, res) => {
  const index = req.body.index;
  const tasks = await Task.find({});
  const task = tasks[index];
  if (task) {
    await Task.findByIdAndDelete(task._id);
  }
  res.redirect("/");
});

app.listen(3000, () => {
  console.log("Server started on http://localhost:3000");
});
