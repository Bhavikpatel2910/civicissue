import express from "express";
import adminAuth from "../middleware/adminAuth.js";
import {
  getDepartments,
  createDepartment
} from "../controllers/department.controller.js";

const router = express.Router();

/* ADMIN ONLY */
router.get("/", adminAuth, getDepartments);
router.post("/", adminAuth, createDepartment);

export default router;
