const mongoose = require("mongoose");
const Schema = mongoose.Schema({
    guild: String,
    channel: String,
    message: String,
    winners: Number,
    prize: String,
    ends: Date,
    start: Date
}, {minimize: false})
module.exports = mongoose.model("Giveaway", Schema)