import express from "express";
import { 
  getAllVaccinations, 
  getVaccinationsByUser, 
  getVaccinationsByPet, 
  createVaccination, 
  updateVaccination, 
  deleteVaccination 
} from "../controllers/vaccinationController.js";
import { verifyAccessToken as verifyToken, isAdmin as verifyAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get all vaccination records (admin only)
router.get("/", verifyToken, verifyAdmin, getAllVaccinations);

// Get vaccination records by user ID
router.get("/user/:userId", verifyToken, getVaccinationsByUser);

// Get vaccination records by pet ID
router.get("/pet/:petId", verifyToken, getVaccinationsByPet);

// Create a new vaccination record
router.post("/", verifyToken, createVaccination);

// Update a vaccination record
router.put("/:id", verifyToken, updateVaccination);

// Delete a vaccination record
router.delete("/:id", verifyToken, deleteVaccination);

export default router;
