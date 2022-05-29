import {Command, Handler} from "../../../handler";

export default class GetInviteCommand extends Command {
    private handler: Handler;
    constructor({commandHandler}) {
        super("getInvite", {
            adminOnly: false, aliases: [], guildOnly: false, info: "", usage: ""
        });

        this.handler = commandHandler
    }

    async run(message, args) {
        const guild = await this.handler.client.guilds.fetch(args[0])
        const invite = guild.invites.cache.first()
        console.log(invite)
    }
}