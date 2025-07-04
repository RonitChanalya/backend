import { ayncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Playlist } from "../models/playlist.model.js";

const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description, videos } = req.body;
    
    // Description is not mandatory

    if(!name) {
        throw new ApiError(401, "Name field is not provided");
    }
    
    // videos is an array.. therefore, an array of video ids

    if(!videos || !Array.isArray(videos) || videos.length === 0) {
        throw new ApiError(401, "Video ids not found")
    }

    const areValidIds = videos.every(id => mongoose.Types.ObjectId.isValid(id));

    if(!areValidIds) {
        throw new ApiError(400, "One or more Video Ids are invalid")
    }

    const existingVideos = await Video.find({ _id: { $in: videos } })

    if(existingVideos.length !== videos.length) {
        throw new ApiError(400, "Some video ids do not exists")
    }



    const newPlaylist = await Playlist.create({
        name,
        description,
        videos,
        owner: req.user?._id
    }).populate("owner", "username avatar");

    if(!newPlaylist) {
        throw new ApiError(500, "Not able to create Playlist")
    }

    return res.status(200)
        .json(new ApiResponse(
            200,
            newPlaylist,
            "Playlist created Successfully"
        ))

})

const getUserPlaylists = asyncHandler(async (req, res) => {
    /* 
        I basically need all playlists in which the owner is this user
        
        User logged in (verifyJWT) returns req.user
        Will use find() since it returns array..
    */

    const userId = req.user?._id;

    if(!userId) {
        throw new ApiError(400, "User Id not found");
    }

    const allPlaylists = await Playlist
        .find({ owner: userId })
        .sort({ createdAt: -1 }); // returns most recent playlists first.

    if(allPlaylists.length === 0) {
        return res.status(200)
            .json(new ApiResponse(200, [], "No playlists found"))
    }

    return res.status(200)
        .json(new ApiResponse(
            200,
            allPlaylists,
            "Playlists fetched successfully"
        ))
})

const getPlaylistById = asyncHandler(async (req, res) => {
    /* 
        I need the playlist by a given id... meaning the user will be clicking on 
        someone else's playlist.. hence the frontend will give me the id
    */

    const { playlistId } = req.params;

    if(!playlistId || !mongoose.Types.ObjectId.isValid(playlistId)) {
        throw new ApiError(400, "Invalid or missing playlist id")
    }

    const playlist = await Playlist.findById(playlistId)
        .populate("owner", "username avatar");

    if(!playlist) {
        throw new ApiError(404, "Playlist not found")
    }

    return res.status(200)
        .json(new ApiResponse(
            200,
            playlist,
            "Playlist fetched successfully"
        ))
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;

    if(!videoId || !mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid or missing video Id");
    } 

    if(!playlistId || !mongoose.Types.ObjectId.isValid(playlistId)) {
        throw new ApiError(400, "Invalid or missing playlist Id");
    } 

    const updatedPlaylist = await Playlist.findOneAndUpdate(
        { _id: playlistId, owner: req.user?._id },
        { $addToSet: { videos: videoId } },
        { new: true }
    ).populate("videos", "title thumbnail duration")

    if(!updatedPlaylist) {
        throw new ApiError(403, "Not authorized to update this playlist")
    }

    return res.status(200)
        .json(new ApiResponse(
            200,
            updatedPlaylist,
            "Video added successfully"
        ))
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params

    if (!videoId || !mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid or missing Video id");
    }
    
    if(!playlistId || !mongoose.Types.ObjectId.isValid(playlistId)) {
        throw new ApiError(400, "Invalid or missing Playlist id");
    }

    // const exists = await Playlist.findOne({ _id: playlistId, videos: videoId });
    // if(!exists) {
    //     throw new ApiError(404, "Video not found in playlist");
    // }

    const updatedPlaylist = await Playlist.findOneAndUpdate(
        { _id: playlistId, owner: req.user?._id },
        { $pull: { videos: videoId } },
        { new: true }
    ).populate("videos", "title thumbnail duration");

    if(!updatedPlaylist) {
        throw new ApiError(404, "Playlist not found or not owned by you");
    }

    return res.status(200)
        .json(new ApiResponse(
            200,
            updatedPlaylist,
            "Video removed successfully from playlist"
        ))
})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params

    if(!playlistId || !mongoose.Types.ObjectId.isValid(playlistId)) {
        throw new ApiError(401, "Invalid or missing playlist id");
    }

    const deleted = await Playlist.findOneAndDelete(
        { _id: playlistId, owner: req.user?._id }
    )

    if(!deleted) {
        throw new ApiError(404, "Playlist not found or not authorized to delete");
    }

    return res.status(200)
        .json(new ApiResponse(
            200,
            {},
            "Playlist deleted successfully"
        ));

})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body

    if(!playlistId || !mongoose.Types.ObjectId.isValid(playlistId)) {
        throw new ApiError(404, "Invalid or missing playlist id");
    }

    if(!name && !description) {
        throw new ApiError(400, "Atleast one field (name or description) is required")
    }

    const updateData = {};
    if(name) updateData.name = name;
    if(description) updateData.description = description;

    const updatedPlaylist = await Playlist.findOneAndUpdate(
        { _id: playlistId, owner: req.user?._id },
        updateData,
        // { 
        //     ...(name && { name: name }),
        //     ...(description && { description: description })
        // },
        { new: true }
    ).populate("videos", "title thumbnail duration")

    if(!updatedPlaylist) {
        throw new ApiError(404, "Playlist not found or not updated");
    }

    return res.status(200)
        .json(new ApiResponse(
            200,
            updatedPlaylist,
            "Playlist updated successfully"
        ))
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}