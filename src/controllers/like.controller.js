import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Like } from "../models/like.model.js";
import mongoose, { isValidObjectId } from "mongoose";

const toggleVideoLike = asyncHandler(async (req, res) => {
    /* 
        Logged in
        when click on like -> id will be passed.. of what?
            id of the video user liked
        Now check if the user has ever liked a video.. 
            basically check if user has a likeSchema with him/her in likedBy
        if not create
        else append the video id to the video field in like schema
    */

    const { videoId } = req.params
    
    if(!videoId || !isValidObjectId(videoId)) {
        throw new ApiError(401, "Invalid or missing video Id");
    }

    const existingLike = await Like.findOne({ likedBy: req.user?._id, video: videoId })

    if(existingLike) {
        await Like.findByIdAndDelete(
            existingLike._id
        )

        return res.status(200)
            .json(new ApiResponse(
                200,
                {},
                "Like removed"
            ))
        } else {
            const newLike = await Like.create({
                likedBy: req.user?._id,
                video: videoId
            })
            return res.status(200)
                .json(new ApiResponse(
                    200,
                    newLike,
                    "Liked successfully"
                ))
        }
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params

    if(!commentId || !isValidObjectId(commentId)) {
        throw new ApiError(401, "Invalid or missing Comment Id")
    }

    const userId = req.user?._id 

    const existingLike = await Like.findOne({ likedBy: userId, comment: commentId })

    if(existingLike) {
        await Like.findByIdAndDelete(
            existingLike._id
        )
        return res.status(200)
            .json(new ApiResponse(
                200,
                {},
                "Like removed"
        ))
    } else {
        const newLike = await Like.create({
            likedBy: userId,
            comment: commentId
        })
        return res.status(200)
            .json(new ApiResponse(
                200,
                newLike,
                "Liked Successfully"
        ))
    }
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params

    if(!tweetId || !isValidObjectId(tweetId)) {
        throw new ApiError(401, "Invalid or missing Tweet Id")
    }

    const userId = req.user?._id 

    const existingLike = await Like.findOne({ likedBy: userId, tweet: tweetId })

    if(existingLike) {
        await Like.findByIdAndDelete(
            existingLike._id
        )
        return res.status(200)
            .json(new ApiResponse(
                200,
                {},
                "Like removed"
        ))
    } else {
        const newLike = await Like.create({
            likedBy: userId,
            tweet: tweetId
        })
        return res.status(200)
            .json(new ApiResponse(
                200,
                newLike,
                "Liked Successfully"
        ))
    }
})

const getLikedVideos = asyncHandler(async (req, res) => {
    const userId = req.user?._id

    const likedVideos = await Like.find({ 
        likedBy: userId,
        video: { $ne: null }
    }).populate("video", "title thumbnail duration")

    if(likedVideos.length === 0) {
        return res.status(200)
            .json(new ApiResponse(
                200,
                [],
                "No liked videos found by user"
            ))
    } else {
        return res.status(200)
            .json(new ApiResponse(
                200,
                likedVideos,
                "Liked videos successfully fetched"
            ))
    }  
})

export {
    toggleVideoLike,
    toggleCommentLike,
    toggleTweetLike,
    getLikedVideos
}