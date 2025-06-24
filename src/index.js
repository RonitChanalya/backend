import dotenv from "dotenv";
dotenv.config({path: './.env'})

import { app } from "./app.js";

import connectDB from "./db/index.js";

connectDB() // async codes give back promises
.then(() => {
    app.on("error", (error) => { // Listening for errors if app is not working. Listening for an event "error", and printing the message if any.
        console.log("ERR: ", error);
        throw error;  
    })

    app.listen(process.env.PORT || 8000, () => {
        console.log(`⚙ Server is listening on port: ${process.env.PORT}`);
    })
})
.catch((error) => {
    console.log("❌ MongoDB connection failed ", error);
})