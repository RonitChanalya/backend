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

// Secured Routes
router.route("/publish-video").post(verifyJWT, upload.single("videoToBeUploaded"), publishAVideo);
router.route("/get-all-videos").get(verifyJWT, getAllVideos);
router.route("/get-video/:id").post(verifyJWT, getVideoById);
router.route('/update-video/:id').post(verifyJWT, upload.fields([
    {
        name: "video",
        maxCount: 1
    },
    {
        name: "thumbnail",
        maxCount: 1
    }
]), updateVideo)
router.route("/delete-video/:id").get(verifyJWT, deleteVideo);
router.route("toggle-publish-status/:id").get(verifyJWT, togglePublishStatus);

const router = Router();