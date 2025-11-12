import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { getCourseAnalytics } from "../controllers/analyticsController.js";
import { getInstructorAnalytics } from "../controllers/analyticsController.js";
import { getComparisonAnalytics } from "../controllers/analyticsController.js";
import { getDepartmentAnalytics } from "../controllers/analyticsController.js";
import { getTrendAnalytics } from "../controllers/analyticsController.js";





const router = express.Router();

// 📊 Course Analytics
router.get("/course", verifyToken, getCourseAnalytics);
// 📊 Instructor Analytics
router.get("/instructor", verifyToken, getInstructorAnalytics);
// 📊 Comparison Analytics
router.get("/compare", verifyToken, getComparisonAnalytics);
// 📊 Department Analytics
router.get("/department", verifyToken, getDepartmentAnalytics);
// 📊 Trend Analytics
router.get("/trend", verifyToken, getTrendAnalytics);






export default router;
