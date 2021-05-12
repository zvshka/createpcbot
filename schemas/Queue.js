import mongoose from "mongoose";
const Schema = mongoose.Schema({
    discord: String,
    code: String
}, {minimize: false})
export default mongoose.model("Queue", Schema)