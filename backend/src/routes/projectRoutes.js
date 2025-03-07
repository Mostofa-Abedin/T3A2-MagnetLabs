import express from "express";
import { authenticateUser } from "../middlewares/authMiddleware.js";
import { authUserOrAdmin } from "../middlewares/authUserOrAdmin.js";
import {
  createProject,
  getAllProjects,
  getClientProjects,
  updateProject,
  deleteProject,
} from "../controllers/projectController.js";

const router = express.Router();

// Route: Create a new project (Admin only)
router.post("/", authenticateUser, authUserOrAdmin, createProject);

// Route: Get all projects (Admin only)
router.get("/", authenticateUser, authUserOrAdmin, getAllProjects);

// Route: Get projects by client ID (Client only)
router.get("/:clientId", authenticateUser, getClientProjects);

// Route: Update a project (Admin only)
router.patch("/:projectId", authenticateUser, authUserOrAdmin, updateProject);

// Route: Delete a project (Admin only)
router.delete("/:projectId", authenticateUser, authUserOrAdmin, deleteProject);

// Route: Public route to get all projects (No authentication required) ) Only for Testing
router.get("/public/all", getAllProjects);

export default router;

