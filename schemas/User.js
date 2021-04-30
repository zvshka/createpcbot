const mongoose = require("mongoose");
const Schema = mongoose.Schema({
    discord: String,
    app: String
}, {minimize: false})
module.exports = mongoose.model("User", Schema)