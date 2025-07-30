const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cors = require('cors');
const caseRoutes = require("./routes/caseRoutes");


dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use(cors());

const allowedOrigins = [
 "https://law-firm-iou5bgi0o-abhinov007s-projects.vercel.app" // your frontend (Vite)
 // "https://law-firm-iou5bgi0o-abhinov007s-projects.vercel.app/dashboard",
 //"https://law-firm-iou5bgi0o-abhinov007s-projects.vercel.app/register",
 // "https://law-firm-iou5bgi0o-abhinov007s-projects.vercel.app/login"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true, // if using cookies/auth headers
}));

app.use('/api/auth', require('./routes/authRoutes'));
app.use("/api/cases", caseRoutes); 

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

