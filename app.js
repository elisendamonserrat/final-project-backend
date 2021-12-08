require("dotenv/config");
require("./db");
const express = require("express");

const isAuthenticated = require("./middleware/isAuthenticated")
const app = express();
require("./config")(app);

// 👇 Start handling routes here
const allRoutes = require("./routes");
app.use("/", allRoutes);

const authRoutes = require("./routes/auth.routes")
app.use("/auth", authRoutes)

const projectRouter = require("./routes/project.routes");
app.use("/api/projects", isAuthenticated, projectRouter);

const taskRouter = require("./routes/task.routes");
app.use("/api/tasks", isAuthenticated, taskRouter);

require("./error-handling")(app);

module.exports = app;
