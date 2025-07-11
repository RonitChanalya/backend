import { isValidObjectId } from "mongoose"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { Comment } from "../models/comment.model.js";

const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if(!videoId || !isValidObjectId(videoId)) {
        throw new ApiError(401, "Invalid or missing video id")
    }

    const comments = await Comment.find({ video: videoId })
        .populate("owner", "username avatar")

    if(comments.length === 0) {
        return res.status(200)
            .json(new ApiResponse(
                200,
                [],
                "This video has no comments"
            ))
    } else {
        return res.status(200)
            .json(new ApiResponse(
                200,
                comments,
                "All comments fetched successfully"
            ))
    }
})

const addComment = asyncHandler(async (req, res) => {
    /* 
        User must be logged in -->verifyJWT
        A user can post multiple comment on a video so no need to see if the user already commented or not
    */

    const { content } = req.body
    const { videoId } = req.params

    if(!content?.trim()) {
        throw new ApiError(400, "Content is missing")
    } 

    if(!videoId || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid or missing Video id")
    }

    const userId = req.user?._id 

    const comment = await Comment.create({
        owner: userId,
        video: videoId,
        content: content
    })

    if(!comment) {
        throw new ApiError(500, "Not able to post comment")
    }

    return res.status(200)
        .json(new ApiResponse(
            200,
            comment,
            "Comment posted successfully"
        ))
})

const updateComment = asyncHandler(async (req, res) => {
    const { content } = req.body;
    
    if(!content?.trim()) {
        throw new ApiError(400, "Updated Content is missing")
    }

    const { commentId } = req.params;

    if(!commentId || !isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid or missing comment Id")
    }

    const updatedComment = await Comment.findOneAndUpdate({
        owner: req.user?._id,
        _id: commentId
        },
        {
            content
        },
        {
            new: true
        }
    ).populate("owner", "username avatar")

    if(!updatedComment) {
        throw new ApiError(404, "not found or unauthorized")
    }

    return res.status(200)
        .json(new ApiResponse(
            200,
            updatedComment,
            "Comment updated successfully"
        ))
})

const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params

    if(!commentId || !isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid or missing comment Id")
    }

    const deletedComment = await Comment.findOneAndDelete({ owner: req.user?._id, _id: commentId });

    if (!deletedComment) {
    throw new ApiError(404, "Comment not found or you're not authorized to delete it");
}

    return res.status(200)
        .json(new ApiResponse(
            200,
            {},
            "Comment Deleted Successfully"
        ))
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
    deleteComment
}