const mongoose = require("mongoose");

const CaseSchema = new mongoose.Schema({
    
        name: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String, required: true },
    
    status: {
        type: String,
        enum: ["Pending", "Active", "Closed"],
        default: "Pending",
    },
    lawyerAssigned: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Reference to Lawyer
}, { timestamps: true });

const Case = mongoose.model("Case", CaseSchema);
module.exports = Case;
