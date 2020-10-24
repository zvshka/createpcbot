const EventSchema = mongoose.Schema({
    id: String,
    name: String,
    description: String,
    target: String,
    ends: Number,
    configs: [],
    winner: String
}, {minimize: false})
module.exports.PCEvent = mongoose.model("Event", EventSchema)