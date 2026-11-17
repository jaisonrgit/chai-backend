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
    // TODO: get video, upload to cloudinary, create video
    const { title , description } = req.body
    const trimString = (data) => data?.trimStart()?.trimEnd()?.trim()

    //validate title and description
    Object.entries({title,description}).some(([name,value]) => {
        if(!trimString(value)) throw new ApiError(200,`${name} is not provided`)
    })

    const videoFile = req.files?.videoFile?.[0]
    const thumbnail = req?.files?.thumbnail?.[0]

    // validate video and image
    Object.entries({videoFile,thumbnail})
    .forEach(([name,obj])=>{
        const mimetype = (name === "videoFile" ? "video" : "image")
        if(!obj || !obj?.mimetype?.startsWith(mimetype)){
            throw new ApiError(415,`${name} should be ${mimetype} format file`)
        }
    })
    
    const [videoUploadResult,thumbnailUploadResult] = await Promise.all([
        uploadOnCloudinary(videoFile.path),
        uploadOnCloudinary(thumbnail.path)
    ])
    
    Object.entries({video : videoUploadResult,image : thumbnailUploadResult})
    .forEach(([name,obj])=> {
        if(!obj.url){
            throw new ApiError(500,`Failed to upload ${name}`)
        }
    })
    
    const video = await Video.create({
        videoFile : videoUploadResult.url,
        thumbnail : thumbnailUploadResult.url,
        owner : req.user?._id,
        title,
        description,
        duration : videoUploadResult.duration
    })

    
    return res
    .status(201)
    .json(
        new ApiResponse(201,video,"video and thumbnail upload successfully")
    )
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    // const video = await Video.aggregate([
    //     {
    //         $match : {
    //             _id : new mongoose.Types.ObjectId(videoId)
    //         },

    //     },

    //     {

    //         $lookup : {
    //             from : "users",
    //             localField : "owner",
    //             foreignField : "_id",
    //             as : "owner", 
    //             pipeline : [
    //                 {$project : {
    //                     _id : 1,
    //                     username : 1,
    //                     avatar : 1
    //                 }}
    //             ]
    //         }
    //     },
    //     {
    //         $addFields : {
    //             owner : {
    //                 $arrayElemAt : ["$owner",0]
    //             }
    //         }
    //     }
    // ])

    const video = await Video.findByIdAndUpdate(videoId,{
        $inc : {
            views : 1
        }
    },
    {
        new : true
    }
).populate("owner","_id username avatar")
    console.log(video)
    if(!video){
        throw new ApiError(404,"Video not found!")
    }
    console.log(req.user.watchHistory)
    const userWatchHistoryPromise = await User.findByIdAndUpdate(req.user._id,{
        $push : {
            watchHistory : video._id
        }
    })
    

    return res.status(200).json(new ApiResponse(200,video,"Video fetch successfully"))
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
