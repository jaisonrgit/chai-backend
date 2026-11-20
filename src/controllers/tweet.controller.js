import mongoose, { isValidObjectId } from "mongoose"
import { Tweet } from "../models/tweet.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const { content } = req.body

    if (!content?.trim()) {
        throw new ApiError(400, "Content required")
    }

    const tweet = await Tweet.create({
        content,
        owner: req.user._id
    })

    if (!tweet) {
        throw new ApiError(500, "Something went wrong while creating tweet")
    }

    return res.status(201).json(new ApiResponse(201, tweet, "Tweet succesfully created"))
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const { userId } = req.params
    const { page = 1, limit = 10, query, sortBy, sortType } = req.query

    const pipeline = [
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        },
    ]

    if (query) {
        pipeline.push({
            $match: {
                content: {
                    $regex: query, $options: "i"
                }
            }
        })
    }

    if (["createdAt", "updatedAt"].includes(sortBy?.trim()?.toLowerCase())) {
        const sortByQuery = {}
        sortByQuery[sortBy] = sortBy === "asc" ? 1 : -1
        pipeline.push(sortByQuery)
    }

    const tweetObjectPromise = Tweet.aggregate(pipeline)

    const tweet = await Tweet.aggregatePaginate(tweetObjectPromise, {
        page,
        limit
    })

    if (!tweet?.docs?.length) {
        throw new ApiError(404, "No Tweets found")
    }

    return res.status(200).json(new ApiResponse(200, tweet, "Tweets successfully fetched"))
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const { tweetId } = req.params
    const { content } = req.body
    if (!content?.trim()) throw new ApiError(400, "Content is required for update the tweet")

    const updatedTweet = await Tweet.findOneAndUpdate(
        {
            _id: tweetId,
            owner: req.user._id
        },
        {
            $set: {
                content
            }
        },
        {
            new: true
        }
    )

    if(!updateTweet) throw new ApiError(404,"tweet not found")

    return res.status(200).json(new ApiResponse(200,updateTweet,"Tweet updated successfully"))

})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const {tweetId} = req.params
    const deletedTweet = await Tweet.findOneAndDelete(
        {_id : tweetId,owner : req.user._id}
        ,{new : true})
    if(!deletedTweet){
        throw new ApiError(404,"Tweet not found")
    }

    return res.status(200).json(new ApiResponse(200,null,"Tweet successfully deleted"))
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}
