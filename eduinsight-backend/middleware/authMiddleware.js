import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const verifyToken = (req, res, next) => {
  console.log("🛰 Incoming request to:", req.method, req.originalUrl);
  console.log("🧾 Headers:", req.headers);

  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    console.log("🚫 No token detected in header!");
    return res.status(401).json({ message: "No token provided." });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    console.log("✅ Token verified for:", verified);
    next();
  } catch (err) {
    console.log("🚫 Token verification failed:", err.message);
    return res.status(403).json({ message: "Invalid or expired token." });
  }
};
