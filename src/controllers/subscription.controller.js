import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    if(!channelId) {
        throw new ApiError(401, "Channel id not foundd");
    }

    const userId = req.user?._id;

    const existingSubscription = await Subscription.findOne({
        channel: channelId,
        subscriber: userId
    })

    if(existingSubscription) {
        await Subscription.deleteOne({_id: existingSubscription._id});

        return res.status(200)
            .json(new ApiResponse(
                200,
                {},
                "Unsubscribed successfully"
            ))
        } else {
            await Subscription.create({
                channel: channelId,
                subscriber: userId
            })

            return res.status(200)
                .json(new ApiResponse(
                    200,
                    {},
                    "Subscribed successfully"
                ))
    }

})
 
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if(!id) {
        throw new ApiError(401, "Channel Id not found")
    }

    const subscribers = await Subscription.find({ channel: id }).populate("subscriber", "username avatar");

    if(subscribers.length === 0) {
        throw new ApiError(404, "Subscribers not found")
    }

    return res.status(200)
        .json(new ApiResponse(
            200,
            subscribers,
            "Subscribers fetched successfully"
        ))
})

const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if(!id) {
        throw new ApiError(401, "User Id not found")
    }

    const channelsSubscribed = await Subscription.find({ subscriber: id }).populate("channel", "username avatar")

    if(channelsSubscribed.length === 0) {
        throw new ApiError(404, "No channels found")
    }

    return res.status(200)
        .json(new ApiResponse(
            200,
            channelsSubscribed,
            "Channels fetched successfully"
        ))
})

const getUserChannelSubscribersCount = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if(!id) {
        throw new ApiError(401, "Channel Id not found")
    }

    const subscriberCount = await Subscription.countDocuments({ channel: id });

    return res.status(200)
        .json(new ApiResponse(
            200,
            { subscriberCount },
            "Subscriber Count fetched successfully"
        ))
})

const getSubscribedChannelsCount = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if(!id) {
        throw new ApiError(401, "User Id not provided");
    }

    const subscribedCount = await Subscription.findById({ subscriber: id });

    return res.status(200)
        .json(new ApiResponse(
            200,
            { subscribedCount },
            "Subscribed channel count fetched successfully"
        ))
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels,
    getUserChannelSubscribersCount,
    getSubscribedChannelsCount
}