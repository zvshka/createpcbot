const {Command} = require("../../../handler");
module.exports = class extends Command {
    constructor() {
        super("giveaway_reroll", {
            aliases: ["greroll"],
            info: "Перевыбрать победителя",
            usage: "giveaway_reroll <message id>",
            guildOnly: true,
            adminOnly: true
        });
    }
    async run(message, args) {

    }
}