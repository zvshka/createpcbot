import mongoose from "mongoose";
const Schema = mongoose.Schema({
    description: String,
    url: String
}, {minimize: false})
export default mongoose.model("Useful", Schema)