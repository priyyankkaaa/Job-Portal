import express from "express";
import { analyzeResume } from "../controllers/analyze.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";

const router = express.Router();

router.post("/:jobId",isAuthenticated, analyzeResume);

export default router;