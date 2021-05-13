import mongoose from "mongoose";
const Schema = mongoose.Schema({
    id: String,
    type: String,
    content: String,
    user: String,
    config: {
        type: Object,
        default: null
    },
    message: {
        type: Object,
        default: null
    }
}, {minimize: false})
export default mongoose.model("Report", Schema)