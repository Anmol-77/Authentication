const mongoose = require("mongoose");
const env = require("dotenv");

env.config();

const dbconnection = async () => {
    try {
        await mongoose.connect(process.env.mongo_url);
        console.log("Database connected");
    } catch (err) {
        console.error("Database connection error:", err);
    }
};

module.exports=dbconnection;