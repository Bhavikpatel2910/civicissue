import express from "express";
import adminAuth from "../middleware/adminAuth.js";
import {
  getIssues,
  assignCrew,
  resolveIssue
} from "../controllers/issue.controller.js";

const router = express.Router();

router.get("/", adminAuth, getIssues);
router.patch("/:issueId/assign", adminAuth, assignCrew);
router.patch("/:issueId/resolve", adminAuth, resolveIssue);

export default router;
