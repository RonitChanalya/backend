import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { v2 as cloudinary } from "cloudinary";

const getAllVideos = asyncHandler(async (req, res) => {
    /*
    user is logged in... checked already
    show videos.. :
        for each video I will return: 
            return video url, title, duration, thumbnail, views, owner
        I have to return multiple videos.
        maybe use array??
    */

    // .find() returns array
    const videos = await Video.find({ isPublished: true })
        .select("-public_id -description -isPublished")
        .populate("owner", "username avatar");

    if(videos.length === 0) {
        return res.status(200)
            .json(new ApiResponse(
                200,
                [],
                "No videos available"
            ))
    }

    return res.status(200)
        .json(new ApiResponse(
            200,
            videos,
            "Videos fetched successfully"
        ))
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

const getVideoById = asyncHandler(async (req, res) => {
    /*
    when the user will click on the video then the video will be played.
        return title, owner, description, views, duration
    */

    const { id } = req.params;

    if(!id) {
        throw new ApiError(400, "Video Id is missing")
    }

    const video = await Video.findById(id)
        .select("-public_id -isPublished -updatedAt -thumbnail")
        .populate("owner", "username avatar");

    if(!video) {
        throw new ApiError(404, "Video not found")
    }
    
    return res.status(200)
        .json(new ApiResponse(
            200,
            video,
            "Video fetched Successfully"
        ))
})

const updateVideo = asyncHandler(async (req, res) => {
    /*
    So while updating video what the user will really do:
        user can update the following things:
            1. thumbnail
            2. title
            3. description
            4. video itself (videoFile)
        
    Need middleware to check if a new video is uploaded or not.
    can get the updating fields from req.body
    */

    const { id } = req.params;

    if(!id) {
        throw new ApiError(401, "Video id not found")
    } 

    const { title, description } = req.body;

    const videoLocalPath = req.files?.video?.[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;
    
    if(!title && !description && !videoLocalPath && !thumbnailLocalPath) {
        throw new ApiError(401, "At least one field must be provided to update");
    }

    let newVideo, newThumbnail;

    if(videoLocalPath){
        newVideo = await uploadOnCloudinary(videoLocalPath);
    }
    if(thumbnailLocalPath){
        newThumbnail = await uploadOnCloudinary(thumbnailLocalPath);
    }

    const updates = {};
    if(title) updates.title = title;
    if(description) updates.description = description;
    if(newVideo){
        updates.videoFile = newVideo.url;
        updates.duration = newVideo.duration;
        updates.public_id = newVideo.public_id;
    }
    if(newThumbnail) {
        updates.thumbnail = newThumbnail.url
    }

    const updatedVideo = await Video.findByIdAndUpdate(
        id,
        {
            $set: updates
        },
        {
            new: true
        }
    ).select("-public_id -createdAt -updatedAt");

    if(!updateVideo) {
        throw new ApiError(404, "Video Not found")
    }

    return res.status(200)
        .json(new ApiResponse(
            200,
            updatedVideo,
            "Video Updated Successfully"
        ))
})

export {
    getAllVideos, 
    publishAVideo,
    getVideoById, 
    updateVideo, // Current
    deleteVideo,
    togglePublishStatus
}