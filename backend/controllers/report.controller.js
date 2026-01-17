import Report from "../models/Report.js";

/* =====================================================
   GET ALL REPORTS (FILTERABLE)
===================================================== */
export const getReports = async (req, res) => {
  try {
    const { search, status, priority } = req.query;

    const query = {};

    if (status && status !== "all") {
      query.status = status;
    }

    if (priority && priority !== "all") {
      query.priority = priority;
    }

    if (search) {
      query.$or = [
        { title: new RegExp(search, "i") },
        { location: new RegExp(search, "i") }
      ];
    }

    const reports = await Report.find(query).sort({ createdAt: -1 });

    const formatted = reports.map(r => ({
      id: r.reportId,
      title: r.title,
      category: r.category,
      location: r.location,
      priority: r.priority,
      status: r.status,
      date: timeAgo(r.createdAt)
    }));

    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load reports" });
  }
};

/* =====================================================
   TIME AGO HELPER
===================================================== */
function timeAgo(date) {
  const seconds = Math.floor((Date.now() - date) / 1000);

  const intervals = [
    { label: "year", seconds: 31536000 },
    { label: "month", seconds: 2592000 },
    { label: "day", seconds: 86400 },
    { label: "hr", seconds: 3600 },
    { label: "min", seconds: 60 }
  ];

  for (const i of intervals) {
    const count = Math.floor(seconds / i.seconds);
    if (count >= 1) return `${count} ${i.label}${count > 1 ? "s" : ""} ago`;
  }

  return "just now";
}
