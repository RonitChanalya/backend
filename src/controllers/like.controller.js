import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Like } from "../models/like.model.js";
import mongoose from "mongoose";

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params
     
    if(!videoId || !mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid or missing video Id");
    }

    const update = {}
    if( videoId ) {
        update.video = videoId;
    } else {
        update.video = null;
    }

    const updatedLikeDocument = await Like.findOneAndUpdate(
        { likedBy: req.user?._id },
        update,
        {
            new: true
        }
    )

    if(!updatedLikeDocument) {
        throw new ApiError(4011, "Not authorized or unable to toggle at the moment");
    }

    return res.status(200)
        .json(new ApiResponse(
            200,
            updatedLikeDocument,
            "Like Toggled Successfully"
        ))

})

const toggleCommentLike = asyncHandler(async (req, res) => {

})

const toggleTweetLike = asyncHandler(async (req, res) => {

})

const getLikedVideos = asyncHandler(async (req, res) => {

})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}