import { Router } from "express";
import { 
    getAllVideos, 
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
 } from "../controllers/video.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

router.route("").post(verifyJWT, upload.single("videoToBeUploaded"), publishAVideo);

const router = Router();