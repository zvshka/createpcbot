import mongoose from "mongoose";
const Schema = mongoose.Schema({
    guild: String,
    channel: String,
    message: String,
    winners: Number,
    prize: String,
    ends: Date,
    start: Date
}, {minimize: false})
export default mongoose.model("Giveaway", Schema)