import express from "express";
import adminAuth from "../middleware/adminAuth.js";

import {
  registerAdmin,
  loginAdmin
} from "../controllers/userAdmin.controller.js";

import { getAdminProfile } from "../controllers/adminProfile.controller.js";
import { getDashboardStats } from "../controllers/dashboard.controller.js";

const router = express.Router();

/* ===============================
   AUTH ROUTES
   =============================== */
router.post("/register", registerAdmin);
router.post("/login", loginAdmin);

/* ===============================
   PROTECTED ADMIN ROUTES
   =============================== */
router.get("/profile", adminAuth, getAdminProfile);
router.get("/dashboard/stats", adminAuth, getDashboardStats);

export default router;
