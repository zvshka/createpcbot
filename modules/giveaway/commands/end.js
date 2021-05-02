const {Command} = require("../../../handler");
module.exports = class extends Command {
    constructor() {
        super("giveaway_end", {
            aliases: ["gend"],
            info: "Преждевременно закончить розыгрыш",
            usage: "gend <message id>",
            guildOnly: true,
            adminOnly: true
        });
    }
    async run(message, args) {

    }
}