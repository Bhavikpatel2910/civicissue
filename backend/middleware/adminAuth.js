import jwt from "jsonwebtoken";

const adminAuth = (req, res, next) => {
  try {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authorization token missing" });
    }

    const token = header.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "admin" && decoded.role !== "Admin") {
      return res.status(403).json({ message: "Admin access only" });
    }

    req.admin = decoded;
    next();

  } catch (err) {
    console.error("Admin Auth Error:", err.message);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

export default adminAuth;
