import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);

        console.log(`\n✅ MongoDB Connected !! DB HOST: ${connectionInstance.connection.host}`);
        
    } catch (error) {
        console.error("Error connecting to MongoDB", error);
        process.exit(1); // 'process' is the reference of our current running application, provided by node itself.
    }
}

export default connectDB