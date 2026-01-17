import express from "express";
import adminAuth from "../middleware/adminAuth.js";
import {
  inviteStaff,
  getAllStaff
} from "../controllers/staff.controller.js";

const router = express.Router();

/* ADMIN ONLY */
router.post("/invite", adminAuth, inviteStaff);
router.get("/", adminAuth, getAllStaff);

export default router;
