import Command from "../../../handler/Command";
export default class GEnd extends Command {
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