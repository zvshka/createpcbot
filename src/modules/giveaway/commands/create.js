import Command from "../../../handler/Command";
export default class GCreate extends Command {
    constructor() {
        super("giveaway_create", {
            aliases: ["gcreate"],
            info: "Создать в текущем канале розыгрыш",
            usage: "giveaway_create",
            guildOnly: true,
            adminOnly: true
        });
    }
    async run(message, args) {

    }
}