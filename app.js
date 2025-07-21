const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
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

const taskSchema = new mongoose.Schema({
  name: String,
  completed: {
    type: Boolean,
    default: false
  }
});

const Task = mongoose.model("Task", taskSchema);

(async () => {
  try {
    const count = await Task.countDocuments({});
    if (count === 0) {
      await Task.insertMany([
        { name: "Learn DSA" },
        { name: "Learn Node.js" },
        { name: "Learn Express.js" },
        { name: "Learn MongoDB" }
      ]);
    }
  } catch (err) {
    console.error("Error inserting default tasks:", err);
  }
})();

app.get("/", async (req, res) => {
  const tasks = await Task.find({});
  res.render("list", { tasks });
});

app.post("/", async (req, res) => {
  const taskName = req.body.taskName;
  if (taskName && taskName.trim() !== "") {
    await Task.create({ name: taskName });
  }
  res.redirect("/");
});

app.post("/toggle", async (req, res) => {
  const taskId = req.body.id;
  if (taskId) {
    const task = await Task.findById(taskId);
    if (task) {
      task.completed = !task.completed;
      await task.save();
    }
  }
  res.redirect("/");
});

app.post("/delete", async (req, res) => {
  const taskId = req.body.id;
  if (taskId) {
    await Task.findByIdAndDelete(taskId);
  }
  res.redirect("/");
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
