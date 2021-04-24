const mongoose = require("mongoose");
const Schema = mongoose.Schema({
    description: String,
    url: String
}, {minimize: false})
module.exports = mongoose.model("Useful", Schema)