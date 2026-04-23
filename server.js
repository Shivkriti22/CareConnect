const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const storyRoutes = require("./routes/storyRoutes");
const symptomRoutes = require("./routes/symptomRoutes");
const chatRoutes = require("./routes/chatRoutes");
const connectionRoutes = require("./routes/connectionRoutes");

dotenv.config();

const app = express();

// connect database
connectDB();

// middleware
app.use(cors());
app.use(express.json());

// routes
app.use("/api/auth", authRoutes);
app.use("/api/stories", storyRoutes);
app.use("/api/symptom-analysis", symptomRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/connections", connectionRoutes);

// test route
app.get("/", (req, res) => {
  res.send("CareConnect Backend Running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});