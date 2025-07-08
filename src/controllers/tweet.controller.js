import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Tweets } from "../models/tweet.model.js";
import { isValidObjectId } from "mongoose"

const createTweet = asyncHandler(async (req, res) => {
    /*
    User logged in
    validate content
    create new Tweet document
        add content
        add user._id
    return
    */

    const { content } = req.body;

    if(!content) {
        throw new ApiError(401, "Content field is mandatory")
    }

    const newTweet = await Tweets.create({
        content,
        owner: req.user?._id
    }).populate("owner", "username avatar");

    if(!newTweet) {
        throw new ApiError(500, "Unable to create tweet");
    }

    return res.status(200)
        .json(new ApiResponse(
            200,
            newTweet,
            "Tweet created successfully"
        ))
})

const getUserTweets = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if(!isValidObjectId(id)) {
        throw new ApiError(401, "User Id not found")
    }

    const allUserTweets = await Tweets.find({ owner: id }).populate("owner", "username avatar");

    if(allUserTweets.length === 0) {
        throw new ApiError(404, "User has no tweets")
    }

    return res.status(200)
        .json(new ApiResponse(
            200,
            allUserTweets,
            "User tweets fetched successfully"
        ))
})

const updateTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;

    const { content } = req.body

    if(!isValidObjectId(tweetId)) {
        throw new ApiError(401, "Tweet id not provided")
    }

    if(!content) {
        throw new ApiError(401, "New content is not provided")
    }

    const updatedTweet = await Tweets.findByIdAndUpdate(
        tweetId, 
        {
            content
        },
        {
            new: true
        }
    ).populate("owner", "username avatar");

    if(!updatedTweet) {
        throw new ApiError(500, "Not able to update tweet")
    }

    return res.status(200)
        .json(new ApiResponse(
            200,
            updatedTweet,
            "Tweet updated Successfully"
        ))
})

const deleteTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;

    if(!isValidObjectId(tweetId)) {
        throw new ApiError(401, "Tweet id not found")
    }

    const deletedTweet = await Tweets.findByIdAndDelete(tweetId);

    if(!deletedTweet) {
        throw new ApiError(500, "Not able to delete Tweet")
    }

    return res.status(200)
        .json(new ApiResponse(
            200,
            {},
            "Tweet deleted Successfully"
        ))
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}