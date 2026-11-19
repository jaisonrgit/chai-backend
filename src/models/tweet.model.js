import mongoose, {Schema} from "mongoose";
import mongooseAggregatePaginateV2 from "mongoose-aggregate-paginate-v2";
const tweetSchema = new Schema({
    content: {
        type: String,
        required: true
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
}, {timestamps: true})

tweetSchema.plugin(mongooseAggregatePaginateV2)
export const Tweet = mongoose.model("Tweet", tweetSchema)