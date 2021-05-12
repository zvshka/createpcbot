import mongoose from "mongoose";
const EventSchema = mongoose.Schema({
    id: String,
    name: String,
    description: String,
    target: String,
    ends: Number,
    configs: [],
    winner: String
}, {minimize: false})
export default mongoose.model("Event", EventSchema)