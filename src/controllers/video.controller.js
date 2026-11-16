import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
    const pipeline = []
    console.log(sortType)

    if (userId?.trim()) {
        const matchUserIdStage = {
            $match : {
                owner : mongoose.Types.ObjectId(userId)
            }
        }
        pipeline.push(matchUserIdStage)
    }

    if (query?.trim()) {
        const queryStage = {
            $match: {
                $or : [
                {title : {$regex: query.trim(),$options: "i"}},
                {description : {$regex: query.trim(),$options: "i"}}
                ]

            }
        }
        pipeline.push(queryStage)
    }
    if (sortBy?.trim() && ["views","duration", "createdAt", "updatedAt"].includes(sortBy.trim().toLowerCase())) {
        const sortByStage = {$sort : {}}
        sortByStage.$sort[sortBy] = sortType?.trim().toLowerCase() === "desc" ? -1 : 1 // dynamic key and value allocation for this stage
        pipeline.push(sortByStage)

    }

    console.log(pipeline)

    const aggregate = Video.aggregate(pipeline)
    const result = await Video.aggregatePaginate(aggregate,{
        limit,
        page
    })
    return res
        .status(200)
        .json(new ApiResponse(200,result,"videos fetched successfully"))

})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body
    // TODO: get video, upload to cloudinary, create video
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
