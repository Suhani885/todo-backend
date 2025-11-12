const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const session = require("express-session");
const MongoStore = require("connect-mongo");
require("dotenv").config();

const app = express();

app.use(
  cors({
    origin: ["https://do-bee-do.vercel.app"],
    credentials: true,
  })
);

app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "secretkey",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
    cookie: {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);

const authRoutes = require("./routes/authRoutes");
app.use("/auth", authRoutes);

const todoRoutes = require("./routes/todoRoutes");
app.use("/todos", todoRoutes);

app.use((req, res) => {
  res.header("Access-Control-Allow-Origin", "https://do-bee-do.vercel.app");
  res.header("Access-Control-Allow-Credentials", "true");
  res.status(404).json({ error: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.header("Access-Control-Allow-Origin", "https://do-bee-do.vercel.app");
  res.header("Access-Control-Allow-Credentials", "true");
  const status = err.status || 500;
  const message = err.message || "Something went wrong";
  res.status(status).json({ error: message });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
