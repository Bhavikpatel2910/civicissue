import Report from "../models/Report.js";
import User from "../models/User.js";

export const getDashboardStats = async (req, res) => {
  try {
    const totalReports = await Report.countDocuments();
    const activeReports = await Report.countDocuments({
      status: { $ne: "Resolved" }
    });

    res.json({
      totalReports,
      activeReports,
      avgResolution: "4.2 hrs",
      activeCrews: 42,
      satisfaction: "88.4%"
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to load stats" });
  }
};
