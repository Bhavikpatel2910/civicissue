import express from "express";
import adminAuth from "../middleware/adminAuth.js";
import {
  getAllIssues,
  assignCrew,
  resolveIssue
} from "../controllers/issue.controller.js";

const router = express.Router();

/* MAP DATA */
router.get("/", adminAuth, getAllIssues);

/* ACTIONS */
router.post("/:id/assign", adminAuth, assignCrew);
router.post("/:id/resolve", adminAuth, resolveIssue);

export default router;
