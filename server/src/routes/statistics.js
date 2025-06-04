import express from "express";
import statisticsController from "../controllers/statistics.js";
import { verifyAccessToken } from "../middleware/authMiddleware.js";

const statisticsRouter = express.Router();

// Simplified statistics routes for admin dashboard

// Thống kê tổng quan - chỉ cần một endpoint
statisticsRouter.get("/dashboard", verifyAccessToken, statisticsController.getBasicStats);

export default statisticsRouter;
