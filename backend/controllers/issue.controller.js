import Report from "../models/Report.js";

/* =========================
   GET ALL ISSUES
========================= */
export const getIssues = async (req, res) => {
  try {
    const issues = await Report.find().sort({ createdAt: -1 });
    res.json(issues);
  } catch (err) {
    res.status(500).json({ message: "Failed to load issues" });
  }
};

/* =========================
   ASSIGN CREW ✅ (MISSING BEFORE)
========================= */
export const assignCrew = async (req, res) => {
  try {
    const { issueId } = req.params;
    const { crew, priority } = req.body;

    const issue = await Report.findById(issueId);
    if (!issue) {
      return res.status(404).json({ message: "Issue not found" });
    }

    issue.assignedCrew = crew;
    issue.priority = priority || issue.priority;
    issue.status = "In Progress";

    issue.timeline = issue.timeline || [];
    issue.timeline.unshift({
      status: "Assigned",
      note: `Assigned to crew: ${crew}`,
      time: new Date()
    });

    await issue.save();

    res.json({ message: "Crew assigned successfully", issue });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to assign crew" });
  }
};

/* =========================
   RESOLVE ISSUE
========================= */
export const resolveIssue = async (req, res) => {
  try {
    const { issueId } = req.params;

    const issue = await Report.findById(issueId);
    if (!issue) {
      return res.status(404).json({ message: "Issue not found" });
    }

    issue.status = "Resolved";
    issue.timeline.unshift({
      status: "Resolved",
      note: "Issue resolved by admin",
      time: new Date()
    });

    await issue.save();

    res.json({ message: "Issue resolved successfully" });

  } catch (err) {
    res.status(500).json({ message: "Failed to resolve issue" });
  }
};
