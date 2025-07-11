import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { Video } from "../models/video.model.js"
import { isValidObjectId } from "mongoose"

const getChannelStats = asyncHandler(async (req, res) => {
    /*
        Get channel stats:
            1. Total subscribers
            2. Total Videos uploaded
            3. Total views
            4. Total likes
            5. Total subscribed channels
    */

    const { channelId } = req.params

    if(!channelId || !isValidObjectId(channelId)) {
        throw new ApiError(401, "Invalid or missing channel id")
    }

    /* 
    1. Total Subscribers: ✅
        To get the total subscribers I need to count the total number of documents of scubsciption model in which channel: channelId

    2. Total Videos Uploaded: ✅
        I need to count the total number of documents of video model in which owner: channeId
    
    3. Total views: 
        I need to sum the views field of all video model documents in which owner: channelId
    
    4. Total Likes:
        I need to sum the count of like model in which video field's owner is channelId

    5. Total subscribed channel: ✅
        I need to count the total number of documents of scubsciption model in which subscriber: channelId
    */

    const channelDetails = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "_id",
                foreignField: "owner",
                as: "totalVideos"
            }
        },
        {
            $addFields: {
                subscribersCount: {
                    $size: "$subscribers"
                },
                subscribedChannelsCount: {
                    $size: "$subscribedTo"
                },
                videoCount: {
                    $size: "$totalVideos"
                }
            }
        },
        {
            $lookup: {
                from: "likes",
                let: { userId: "$_id" },
                pipeline: [
                    {
                        $lookup: {
                            from: "videos",
                            localField: "video",
                            foreignField: "_id",
                            as: "videoDoc"
                        }
                    }
                ]
            }
        }
    ])
    
})

const getChannelVideos = asyncHandler(async (req, res) => {
    /*
        Get all videos uploaded by the channel.
        Basically I need all the video document which has owner as the logged in user
    */

    const userid = req.user?._id;

    const videos = await Video.find({ owner: userid })
        .select("-description -isPublished -public_id")
        .populate("owner", "username avatar")

    if(videos.length === 0) {
        return res.status(200)
            .json(new ApiResponse(
                200,
                [],
                "This channel has no videos"
            ))
    } else {
        return res.status(200)
            .json(new ApiResponse(
                200,
                videos,
                "All videos fetched successfully"
            ))
    }

})

export {
    getChannelStats, 
    getChannelVideos
}