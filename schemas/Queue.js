const mongoose = require("mongoose");
const Schema = mongoose.Schema({
    discord: String,
    code: String
}, {minimize: false})
module.exports = mongoose.model("Queue", Schema)