const {Event} = require('../../handler');
const express = require('express')
const app = express()

module.exports = class extends Event {
    constructor() {
        super('ready');
    }

    async run(client) {
        app.get("/", (req, res) => {
            res.send("OK")
        })
        app.listen(3000)
    }
};
