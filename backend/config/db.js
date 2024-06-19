import mongoose from "mongoose"
import dotenv from "dotenv"
// Load environment variables from .env file
dotenv.config();

const URI = process.env.DB_URI;
const connection = mongoose.connect(URI)
.then(() => {
    console.log("DB connection is successfull!");
}).catch((error) => {
    console.log("Some Error in DB connection", error);
})

export default connection;