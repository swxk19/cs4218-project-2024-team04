import express from "express";
import colors from "colors";
import dotenv from "dotenv";
import morgan from "morgan";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoute.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import cors from "cors";

if (process.env.NODE_ENV === "production") {
  dotenv.config({ path: "./env" }); // default to dev server, no real prod db
} else if (process.env.NODE_ENV === "test") {
  dotenv.config({ path: "./.env.test" });
} else {
  dotenv.config({ path: "./.env" });

}

// Connect to the database
await connectDB();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/category", categoryRoutes);
app.use("/api/v1/product", productRoutes);

// REST API
app.get("/", (req, res) => {
  res.send("<h1>Welcome to ecommerce app</h1>");
});

// Only start the server if not in test environment
const PORT = process.env.PORT || 6060;
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(
      `Server running in ${process.env.DEV_MODE} mode on port ${PORT}`.bgCyan.white
    );
  });
}

export default app; // Export the app for testing purposes
