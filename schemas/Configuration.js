const mongoose = require('mongoose')
const ConfigSchema = new mongoose.Schema({
    ID: String,
    description: String,
    author: String,
    name: String,
    price: String,
    eventCode: String,
    CPU: {
        price: String,
        model: String
    },
    body: {
        price: String,
        model: String,
        image: String,
        standards: String,
        format: String
    },
    cooler: {
        price: String,
        model: String,
        dispersion: String
    },
    GPU: {
        price: String,
        model: String,
        count: ""
    },
    PSU: {
        price: String,
        model: String
    },
    RAM: {
        price: String,
        model: String,
        count: String,
        kit: String
    },
    motherboard: {
        price: String,
        model: String
    },
    HDD: [],
    SSD: [],
    M2: [],
}, {minimize: false})
module.exports.Configuration = mongoose.model("Configuration", ConfigSchema)