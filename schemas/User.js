import mongoose from "mongoose";
const Schema = mongoose.Schema({
    discord: String,
    app: String
}, {minimize: false})
export default mongoose.model("User", Schema)