import Staff from "../models/staff.js";

/* ===============================
   INVITE STAFF
   =============================== */
export const inviteStaff = async (req, res) => {
  try {
    const { name, empId, email, department, photo } = req.body;

    if (!name || !empId || !email || !department) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    if (!email.endsWith("@smartcity.gov")) {
      return res.status(400).json({
        message: "Invalid government email"
      });
    }

    const exists = await Staff.findOne({
      $or: [{ empId }, { email }]
    });

    if (exists) {
      return res.status(409).json({
        message: "Staff already invited"
      });
    }

    const staff = await Staff.create({
      name,
      empId,
      email,
      department,
      photo,
      invitedBy: req.admin.id
    });

    res.status(201).json({
      message: "Staff invited successfully",
      staff
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server error while inviting staff"
    });
  }
};

/* ===============================
   GET ALL STAFF
   =============================== */
export const getAllStaff = async (req, res) => {
  try {
    const staff = await Staff.find().sort({ createdAt: -1 });
    res.json(staff);
  } catch {
    res.status(500).json({ message: "Failed to load staff" });
  }
};
