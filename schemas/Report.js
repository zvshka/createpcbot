const mongoose = require("mongoose");
const Schema = mongoose.Schema({
    id: String,
    type: String,
    content: String,
    config: {
        type: Object,
        default: null
    },
    message: {
        type: Object,
        default: null
    }
}, {minimize: false})
module.exports = mongoose.model("Report", Schema)