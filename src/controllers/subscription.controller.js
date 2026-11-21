import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription
    const subscription = await Subscription.findOneAndDelete({channel : channelId,subscriber : req.user._id})
    if(!subscription){
        const newSubscription = await Subscription.create({
            channel : channelId,
            subscriber : req.user._id
        })

        return res.status(201).json(new ApiResponse(201,"user successfully subscribed"))
    }

    return res.status(200).json(new ApiResponse(200,"user successfully unsubscribed"))
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    const {page=1,limit=10} = req.query
    const subscribers = Subscription.aggregate([
        {
            $match : {
                channel : new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup : {
                from : "users",
                localField : "subscriber",
                foreignField : "_id",
                as : "subscriber",
                pipeline : [
                    {
                        $project : {
                            _id : 1,
                            username : 1,
                            email : 1,
                            fullName : 1,
                            avatar : 1
                        }
                    }
                ]
            }
        },
        {
            $addFields : {
                subscriber : {
                    $first : "$subscriber"
                }
            }
        },
        {
            $project : {
                channel : 0,
                __v : 0
            }
        }
    ])
    console.log(channelId)
    const paginateSubscriber = await Subscription.aggregatePaginate(subscribers,{page,limit})

    return res.status(200).json(new ApiResponse(200,paginateSubscriber,"Subscribers Successfully fetched"))
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
    const {page=1,limit=10} = req.query
    const subscribers = Subscription.aggregate([
        {
            $match : {
                subscriber : new mongoose.Types.ObjectId(subscriberId)
            }
        },
        {
            $lookup : {
                from : "users",
                localField : "channel",
                foreignField : "_id",
                as : "channel",
                pipeline : [
                    {
                        $project : {
                            username : 1,
                            email : 1,
                            fullName : 1,
                            avatar : 1,
                        }
                    }
                ]
            }
        },
        {
            $addFields : {
                channel : {
                    $arrayElemAt : ["$channel",0]
                }
            }
        },

        {
            $project : {
                subscriber : 0,
                __v : 0
            }
        }
    ])

    const paginateSubscriber = await Subscription.aggregatePaginate(subscribers,{page,limit})

    return res.status(200).json(new ApiResponse(200,paginateSubscriber,"Subscribers Successfully fetched"))
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}