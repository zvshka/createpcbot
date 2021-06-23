import mongoose from "mongoose";
const Schema = new mongoose.Schema({
    trigger: String,
    guild: String,
    action: Object
})
export default mongoose.model("Trigger", Schema)