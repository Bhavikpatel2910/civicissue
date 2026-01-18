import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";


import adminAuthRoutes from "./routes/adminAuth.routes.js";
import issueRoutes from "./routes/issue.routes.js";
import departmentRoutes from "./routes/department.routes.js";
import staffRoutes from "./routes/auth.js";
import reportRoutes from "./routes/report.routes.js";
import adminSettingsRoutes from "./routes/adminSettings.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import authRoutes from "./routes/auth.js";

dotenv.config();

/* ======================
   INIT APP
====================== */
const app = express();

/* ======================
   MIDDLEWARE
====================== */
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ======================
   STATIC FILES (IMPORTANT)
====================== */
app.use("/uploads", express.static("uploads"));

/* ======================
   ROUTES (NO COLLISION)
====================== */

// Auth (login / register / dashboard / community)
app.use("/api/auth", authRoutes);

// Staff
app.use("/api/staff", staffRoutes);


// Reports
app.use("/api/report", reportRoutes);

// Admin
app.use("/api/admin", adminAuthRoutes);
app.use("/api/admin/issues", issueRoutes);
app.use("/api/admin/departments", departmentRoutes);
app.use("/api/admin/settings", adminSettingsRoutes);
app.use("/api/admin", adminRoutes);

/* ======================
   ROOT CHECK
====================== */
app.get("/", (req, res) => {
  res.send("Backend running successfully");
});

/* ======================
   DATABASE
====================== */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  });

/* ======================
   START SERVER
====================== */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
