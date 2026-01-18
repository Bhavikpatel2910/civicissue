// import express from "express";
// import adminAuth from "../middleware/adminAuth.js";

// import {
//   registerAdmin,
//   loginAdmin
// } from "../controllers/userAdmin.controller.js";

// import { getAdminProfile } from "../controllers/adminProfile.controller.js";
// import { getDashboardStats } from "../controllers/dashboard.controller.js";

// const router = express.Router();

// /* ===============================
//    AUTH ROUTES
//    =============================== */
// router.post("/register", registerAdmin);
// router.post("/login", loginAdmin);

// /* ===============================
//    PROTECTED ADMIN ROUTES
//    =============================== */
// router.get("/profile", adminAuth, getAdminProfile);
// router.get("/dashboard/stats", adminAuth, getDashboardStats);

// export default router;

import express from "express";
import adminAuth from "../middleware/adminAuth.js";
import { getAdminProfile } from "../controllers/adminProfile.controller.js";
import { getDashboardStats } from "../controllers/dashboard.controller.js";

const router = express.Router();

// analytics departments wise 
// routes/adminReports.js
router.get("/reports/analytics/departments", adminAuth, async (req, res) => {
  try {
    const data = await Report.aggregate([
      {
        $group: {
          _id: "$department",
          total: { $sum: 1 },
          resolved: {
            $sum: { $cond: [{ $eq: ["$status", "Resolved"] }, 1, 0] }
          },
          pending: {
            $sum: { $cond: [{ $ne: ["$status", "Resolved"] }, 1, 0] }
          }
        }
      },
      { $sort: { total: -1 } }
    ]);

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Analytics error" });
  }
});


router.get("/profile", adminAuth, getAdminProfile);
router.get("/dashboard/stats", adminAuth, getDashboardStats);

export default router;
