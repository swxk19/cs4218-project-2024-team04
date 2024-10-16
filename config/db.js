import mongoose from "mongoose";
import colors from "colors";
import dotenv from "dotenv";

if (process.env.NODE_ENV === "production") {
    dotenv.config({ path: "./env" }); // default to dev server, no real prod db
} else if (process.env.NODE_ENV === "test") {
    dotenv.config({ path: "./.env.test" });
} else {
    dotenv.config({ path: "./.env" });
}

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URL);
        console.log(`Connected To Mongodb Database ${conn.connection.host}`.bgMagenta.white);
    } catch (error) {
        console.log(`Error in Mongodb ${error}`.bgRed.white);
    }
};

export default connectDB;