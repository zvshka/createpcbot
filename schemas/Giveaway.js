const mongoose = require("mongoose");
const Schema = mongoose.Schema({
    channel: String,
    message: String,
    ends: Date,
    start: Date
}, {minimize: false})
module.exports = mongoose.model("Giveaway", Schema)