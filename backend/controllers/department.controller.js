import Department from "../models/Department.js";

/* ===============================
   GET ALL DEPARTMENTS
   =============================== */
export const getDepartments = async (req, res) => {
  try {
    const departments = await Department.find().sort({ name: 1 });
    res.json(departments);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch departments" });
  }
};

/* ===============================
   CREATE DEPARTMENT
   =============================== */
export const createDepartment = async (req, res) => {
  try {
    const { name, code } = req.body;

    if (!name || !code) {
      return res.status(400).json({ message: "Name and code required" });
    }

    const exists = await Department.findOne({
      $or: [{ name }, { code }]
    });

    if (exists) {
      return res.status(409).json({
        message: "Department already exists"
      });
    }

    const department = await Department.create({
      name,
      code,
      staff: Math.floor(Math.random() * 200) + 20,
      orders: Math.floor(Math.random() * 120),
      sla: Math.floor(Math.random() * 20) + 75
    });

    res.status(201).json({
      message: "Department created",
      department
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
