import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import adminAuthRoutes from "./routes/adminAuth.routes.js";
import issueRoutes from "./routes/issue.routes.js";
import departmentRoutes from "./routes/department.routes.js";
import staffRoutes from "./routes/staff.routes.js";
import reportRoutes from "./routes/report.routes.js";
import adminSettingsRoutes from "./routes/adminSettings.routes.js";
import adminRoutes from "./routes/admin.routes.js";


dotenv.config();

/* ======================
   INIT APP  ✅ FIRST
   ====================== */
const app = express();

/* ======================
   MIDDLEWARE
   ====================== */
app.use(cors());
app.use(express.json());

/* ======================
   ROUTES  ✅ AFTER app
   ====================== */
app.use("/api/admin", adminAuthRoutes);

/* ======================
   ROOT CHECK
   ====================== */
app.get("/", (req, res) => {
  res.send("Admin backend running");
});

/* ======================
   DATABASE
   ====================== */
mongoose.connect(process.env.MONGO_URI)

/* ROUTES issue */
app.use("/api/admin/issues", issueRoutes);


/* ROUTES department */
app.use("/api/admin/departments", departmentRoutes);

/* ROUTES staff */
app.use("/api/admin/staff", staffRoutes);
  
/* ROUTES report */
app.use("/api/reports", reportRoutes);

/* ROUTES admin settings */
app.use("/api/admin", adminSettingsRoutes);

/* ROUTES admin */
app.use("/api/admin", adminRoutes);

/* ======================
   START SERVER
   ====================== */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
