import express, { urlencoded } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors({ // configuring cors
    origin: process.env.CORS_ORIGIN, 
    credentials: true
}))

app.use(express.json({ limit: "16kb" })); // Parsing json data
app.use(urlencoded({ extended: true, limit: "16kb" })); // Parsing url data
app.use(express.static("public")); // Storing some sort of files, pdf, images, favicon, etc.. in the server itself. 
app.use(cookieParser()); // Parsing the cookies in order to do CRUD operations in the cookie

// importing routes
import userRouter from "./routes/user.route.js";

// routes declaration
app.use("/api/v1/users", userRouter)



export { app }