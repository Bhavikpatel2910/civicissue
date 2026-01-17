import Issue from "../models/Issue.js";

/* ===============================
   GET SINGLE ISSUE
   =============================== */
export const getIssueById = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ message: "Issue not found" });
    }
    res.json(issue);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

/* ===============================
   UPDATE ISSUE
   =============================== */
export const updateIssue = async (req, res) => {
  try {
    const { status, priority, crew } = req.body;

    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ message: "Issue not found" });
    }

    if (status) issue.status = status;
    if (priority) issue.priority = priority;
    if (crew !== undefined) issue.crew = crew;

    issue.activityLog.unshift({
      message: `Issue updated → Status: ${status}, Priority: ${priority}, Crew: ${crew || "Unassigned"}`
    });

    await issue.save();

    res.json({
      message: "Issue updated successfully",
      issue
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

/* ===============================
   ADD INTERNAL NOTE
   =============================== */
export const addIssueNote = async (req, res) => {
  try {
    const { note } = req.body;

    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ message: "Issue not found" });
    }

    issue.activityLog.unshift({
      message: `Internal Note: ${note}`
    });

    await issue.save();

    res.json({
      message: "Note added",
      activityLog: issue.activityLog
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
