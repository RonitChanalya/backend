import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { Video } from "../models/video.model.js"
import { isValidObjectId } from "mongoose"
import { Subscription } from "../models/subscription.model.js"

const getChannelStats = asyncHandler(async (req, res) => {
    /*
        Get channel stats:
            1. Total subscribers
            2. Total Videos uploaded
            3. Total views
            4. Total likes
            5. Total subscribed channels

    1. Total Subscribers: 
        To get the total subscribers I need to count the total number of documents of scubsciption model in which channel: channelId

    2. Total Videos Uploaded: 
        I need to count the total number of documents of video model in which owner: channeId
    
    3. Total views: 
        I need to sum the views field of all video model documents in which owner: channelId
    
    4. Total Likes:
        I need to sum the count of like model in which video field's owner is channelId

    5. Total subscribed channel: 
        I need to count the total number of documents of scubsciption model in which subscriber: channelId
    */

    const { channelId } = req.params;
    
    if(!channelId || !isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid or missing Channel Id");
    }

    const totalSubscribers = await Subscription.countDocuments({ channel: channelId });

    const totalVideos = await Video.countDocuments({ owner: channelId });

    const totalViews = await Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $group: { // What does group do
                _id: null,
                totalViews: {
                    $sum: "$views"
                }
            }
        }
    ]);

    const totalLikes = await Like.aggregate([
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "videoDoc"
            }
        },
        {
            $unwind: "$videoDoc"
        },
        {
            $match: {
                "videoDoc.owner": new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $count: "totalLikes" // How is this working
        }
    ]);

    const totalSubscribedTo = await Subscription.countDocuments({ subscriber: channelId });

    totalViews = totalViews[0]?.totalViews || 0;
    totalLikes = totalLikes[0]?.totalLikes || 0;

    return res.status(200)
        .json(new ApiResponse(
            200,
            {
                totalSubscribers,
                totalSubscribedTo,
                totalViews,
                totalLikes,
                totalVideos
            },
            "Channel stats fetched successfully"
        ))
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