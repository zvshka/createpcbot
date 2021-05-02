const {Command} = require("../../../handler");
module.exports = class extends Command {
    constructor() {
        super("giveaway_list", {
            aliases: ["glist", "giveaways"],
            info: "Посмотреть список розыгрышей на сервере",
            usage: "giveaway_list",
            guildOnly: true,
            adminOnly: true
        });
    }
    async run(message, args) {

    }
}