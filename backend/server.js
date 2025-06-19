import "express-async-errors";

//  config env
import * as dotenv from "dotenv";
dotenv.config();

// create app
import express from "express";
const app = express();

// packages
import morgan from "morgan";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cloudinary from "cloudinary";
import cors from "cors";
//routers
import authRouter from "./routes/authRouter.js";

//public
import path, { dirname } from "path";
import { fileURLToPath } from "url";

//middleware
import errorHandlerMiddleware from "./middleware/errorhandlerMiddleware.js";

// cloudinary setup
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

const __dirname = dirname(fileURLToPath(import.meta.url));

if (process.env.NODE_ENV === "devlopment") {
  app.use(morgan("dev"));
}
app.use(express.static(path.resolve(__dirname, "./public")));
app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: [...process.env.ALLOWED_ORIGINS],
    methods: ["GET", "POST", "PUT", "DELETE","OPTIONS","PATCH"],
    credentials: true,
  })
);

// use routes here
app.use("/api/v1/auth", authRouter);
// entry point prod...
app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "./public", "index.html"));
});

//not found
app.use("*", (req, res) => {
  res.status(404).json({ msg: "Route not found " });
});

//err HANDLING  middleware
app.use(errorHandlerMiddleware);

const port = process.env.PORT;
try {
  await mongoose.connect(process.env.MONGO_URL);
  app.listen(port, () => {
    console.log(`Server listening on ${port}...`);
  });
} catch (error) {
  console.log({ error });
  process.exit(1);
}
