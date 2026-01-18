// import jwt from "jsonwebtoken";

// /**
//  * AUTH MIDDLEWARE
//  * ----------------
//  * • Verifies Bearer token
//  * • Attaches decoded payload to req.user
//  * • Returns clean 401 errors
//  */
// export default function auth(req, res, next) {
//   try {
//     /* ===============================
//        1️⃣ READ AUTH HEADER
//     ================================ */
//     const authHeader = req.headers.authorization;

//     if (!authHeader) {
//       return res.status(401).json({
//         message: "Authorization header missing"
//       });
//     }

//     /* ===============================
//        2️⃣ VALIDATE FORMAT
//     ================================ */
//     if (!authHeader.startsWith("Bearer ")) {
//       return res.status(401).json({
//         message: "Invalid authorization format (Bearer token required)"
//       });
//     }

//     /* ===============================
//        3️⃣ EXTRACT TOKEN
//     ================================ */
//     const token = authHeader.split(" ")[1];

//     if (!token || token === "null" || token === "undefined") {
//       return res.status(401).json({
//         message: "Token missing or malformed"
//       });
//     }

//     /* ===============================
//        4️⃣ VERIFY TOKEN
//     ================================ */
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     /* ===============================
//        5️⃣ ATTACH USER
//     ================================ */
//     req.user = decoded;

//     next();

//   } catch (err) {
//     // 🔴 Log exact JWT reason (signature / expired / malformed)
//     console.error("JWT ERROR:", err.message);

//     return res.status(401).json({
//       message: "Invalid or expired token"
//     });
//   }
// }


import jwt from "jsonwebtoken";

export default function auth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Missing or invalid token" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;
    next();

  } catch (err) {
    console.error("JWT ERROR:", err.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}
