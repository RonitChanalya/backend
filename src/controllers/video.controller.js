import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { v2 as cloudinary } from "cloudinary";

const getAllVideos = asyncHandler(async (req, res) => {

})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body;

    if(!(title || description)) {
        throw new ApiError(401, "Title and Description is required")
    }

    const videoLocalPath = req.file?.path;

    if(!videoLocalPath) {
        throw new ApiError(401, "Video path not found")
    }

    const video = await uploadOnCloudinary(videoLocalPath);

    if(!video) {
        throw new ApiError(500, "Cloudinary upload failed");
    }

    const uploadedVideo = await Video.create({
            title,
            description,
            videoFile: video.url,
            duration: video.duration,
            owner: req.user._id,
            public_id: video.public_id,
            thumbnail: cloudinary.url(video.public_id + '.jpg', {
                resource_type: 'video',
                format: 'jpg',
                width: 300,
                height: 200,
                crop: "fill",
                start_offset: "1"
            }),
        }
    );
    
    return res.status(200)
        .json(new ApiResponse(
            200,
            uploadedVideo,
            "Video Uploaded Successfully"
        ));

})

export {
    getAllVideos, 
    publishAVideo,// Current
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}