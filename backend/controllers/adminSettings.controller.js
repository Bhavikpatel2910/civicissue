import Admin from "../models/Admin.js";
import bcrypt from "bcryptjs";

/* =========================
   GET ADMIN PROFILE
========================= */
export const getAdminSettings = async (req, res) => {
  const admin = await Admin.findById(req.admin.id).select("-password");
  res.json(admin);
};

/* =========================
   UPDATE SETTINGS
========================= */
export const updateAdminSettings = async (req, res) => {
  const { name, email, department, language, notifications } = req.body;

  const admin = await Admin.findByIdAndUpdate(
    req.admin.id,
    { name, email, department, language, notifications },
    { new: true }
  ).select("-password");

  res.json({
    message: "Settings updated successfully",
    admin
  });
};

/* =========================
   CHANGE PASSWORD
========================= */
export const changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const admin = await Admin.findById(req.admin.id);

  const match = await bcrypt.compare(oldPassword, admin.password);
  if (!match) {
    return res.status(400).json({ message: "Old password incorrect" });
  }

  admin.password = await bcrypt.hash(newPassword, 10);
  await admin.save();

  res.json({ message: "Password changed successfully" });
};
