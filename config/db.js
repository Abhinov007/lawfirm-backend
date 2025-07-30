const mongoose = require('mongoose');

const MONGO_URI= "mongodb+srv://abhinov007:bulobuli1234@cluster0.xaohu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const connectDB = async () => {
    try {
        console.log(" Attempting to connect to MongoDB...");

        const conn = await mongoose.connect(MONGO_URI);

        console.log(` MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(` MongoDB Connection Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;

