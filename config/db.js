import mongoose from "mongoose";
import colors from "colors";
import dotenv from "dotenv";

var mongoUrl = undefined
if (process.env.NODE_ENV === "production") {
    dotenv.config({ path: "./env" }); // default to dev server, no real prod db
    mongoUrl = process.env.MONGO_URL
} else if (process.env.NODE_ENV === "test") {
    dotenv.config({ path: "./.env.test" });
    mongoUrl = process.env.MONGO_TEST_URL
} else {
    dotenv.config({ path: "./.env" });
    mongoUrl = process.env.MONGO_URL
}

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(mongoUrl);
        console.log(`Connected To Mongodb Database ${conn.connection.host}`.bgMagenta.white);
    } catch (error) {
        console.log(`Error in Mongodb ${error}`.bgRed.white);
    }
};

export default connectDB;