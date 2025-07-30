const Case= require("../models/caseModel");
const User= require("../models/UserModel");
const sendEmail = require("../utils/sendEmail");

//Create new Cases(By Client)
const createCase= async(req,res)=>{
    try {
            const {name,email,phone}= req.body;
    
            if (!name || !email || !phone ) {
                return res.status(400).json({ message: "All fields are required" });
            }
            const newCase = new Case({name,email,phone});
            await newCase.save();
    
            await sendEmail(
                process.env.EMAIL_USER,
                "New Case Submission",
                `A new case has been submitted.\n\nClient: ${name}\nEmail: ${email}\nPhone: ${phone}\n\nCase `
            );
    
            res.status(201).json({ message: "Case submitted successfully. Admin will contact you soon." });
            
        } catch (error) {
            res.status(500).json({ message: "Server error", error: error.message });
        }

};
 
const getAllCases = async (req, res) => {
    try {
        const cases = await Case.find().populate("lawyerAssigned", "name email"); // Ensure "User" model is available
        res.json(cases);
    } catch (error) {
        console.error("Error fetching cases:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};


//get cases
const getCases= async(req,res)=>{
    console.log("Received Case ID:", req.params.id);
    try {
        let cases;
        const caseId = req.params.id;
        if(req.user.role==="admin"){
            cases = await Case.find({ _id: caseId }).populate('lawyerAssigned', 'name email');
        }
        else if (req.user.role === 'lawyer') {
            cases = await Case.find({ lawyerAssigned: req.user._id });
        } 
        else {
            return res.status(403).json({ message: "Unauthorized" });
        }
        res.json(cases);
    } catch (error) {
        console.error("Error fetching cases:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

//Update the cases 
const updateCase= async(req, res)=>{
    try {
        const{status,lawyerId}= req.body;
        const caseId = req.params.id;
        

        let caseToUpdate = await Case.findById(caseId);
        if (!caseToUpdate) {
            return res.status(404).json({ message: "Case not found" });
        }
        if (status) caseToUpdate.status = status;
        if (lawyerId) {
            const lawyer = await User.findById(lawyerId);
            if (!lawyer || lawyer.role.toLowerCase() !== "lawyer") {
                return res.status(400).json({ message: "Invalid lawyer ID" });
            }
            caseToUpdate.lawyerAssigned = lawyer._id;
        }
        await caseToUpdate.save();
        res.json({ message: "Case updated successfully", caseToUpdate });

    } catch (error) {
        console.error("Error updating case:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

//delete cases
const deleteCase = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: "Access denied. Only admin can delete cases." });
        }
        const caseId = req.params.id;
        const caseToDelete = await Case.findByIdAndDelete(caseId);
        if (!caseToDelete) {
            return res.status(404).json({ message: "Case not found" });
        }
        res.json({ message: "Case deleted successfully" });
    } catch (error) {
        console.error("Error deleting case:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
const assignLawyer = async (req, res) => {
    try {
        const { lawyerName } = req.body;  // Accept lawyer name
        const caseId = req.params.caseId;
        console.log("Received Case ID:", caseId);

        const caseToUpdate = await Case.findById(caseId);
        if (!caseToUpdate) {
            return res.status(404).json({ message: "Case not found" });
        }

        // Find the lawyer by their name (case-insensitive)
        const lawyer = await User.findOne({ name: new RegExp(`^${lawyerName}$`, 'i') });
        if (!lawyer || lawyer.role.toLowerCase() !== "lawyer") {
            return res.status(400).json({ message: "Invalid lawyer name" });
        }

        // Assign the lawyer to the case
        caseToUpdate.lawyerAssigned = lawyer._id;
        await caseToUpdate.save();

        res.json({ message: "Lawyer assigned successfully", case: caseToUpdate });
    } catch (error) {
        console.error("Error assigning lawyer:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Get cases assigned to the currently logged-in lawyer
const getMyCases = async (req, res) => {
  try {
    if (req.user.role !== 'lawyer') {
      return res.status(403).json({ message: "Access denied. Only lawyers can view this." });
    }

    const cases = await Case.find({ lawyerAssigned: req.user._id }).populate("lawyerAssigned", "name email");
    res.status(200).json(cases);
  } catch (error) {
    console.error("Error fetching lawyer's cases:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};



module.exports = { createCase, getAllCases, getCases, updateCase, deleteCase, assignLawyer, getMyCases };
