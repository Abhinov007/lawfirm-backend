const express= require("express");
const router= express.Router();
const Case= require("../models/caseModel");
const { createCase, getCases,getAllCases, updateCase, deleteCase, getMyCases, assignLawyer} = require("../controllers/caseController");
const { authMiddleware, roleCheck } = require("../middleware/authMiddleware");

// Create case (Client)
router.post("/submit", createCase);

// Get all cases (Admin/Lawyer)
router.get("/getAllcases", authMiddleware, roleCheck(["admin"]), getAllCases);

// Get specific case by ID
router.get("/getCases/:id", authMiddleware, getCases);

// ✅ Lawyer: Get all cases assigned to the logged-in lawyer
router.get("/my-cases", authMiddleware, roleCheck(["lawyer"]), getMyCases);


// Update case (Admin)
router.put("/update/:id", authMiddleware,  updateCase);

// Assign Lawyer (Admin)
router.put("/assign/:caseId", authMiddleware, roleCheck(["admin"]), assignLawyer);

// Delete case (Admin)
router.delete("/delete/:id", authMiddleware, roleCheck(["admin"]), deleteCase);

module.exports = router;