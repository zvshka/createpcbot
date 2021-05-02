const {Command} = require("../../../handler");
module.exports = class extends Command {
    constructor() {
        super("giveaway_start", {
            aliases: ["gstart"],
            info: "Быстро создать в текущем канале розыгрыш",
            usage: "giveaway_start <time> [winners] [prize]",
            guildOnly: true,
            adminOnly: true
        });
    }
    async run(message, args) {

    }
}