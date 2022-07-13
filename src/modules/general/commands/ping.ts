import {stripIndents} from "common-tags";
import {Command} from "../../../handler";

export default class PingCommand extends Command {
    constructor() {
        super('ping', {
            aliases: ['pong'],
            info: 'Пинг и латенси бота',
            usage: 'ping',
            guildOnly: false,
            adminOnly: false
        });
    }


    async run(message) {
        const msg = await message.channel.send('Pinging...');
        const ping = Math.round(msg.createdTimestamp - message.createdTimestamp);

        if (ping <= 0) {
            return msg.edit('Please try again...');
        }

        return msg.edit(
            stripIndents`
      🏓 P${'o'.repeat(Math.ceil(ping / 100))}ng: \`${ping}ms\`
      💓 Heartbeat: \`${Math.round(message.client.ws.ping)}ms\`
      `,
        );
    }
};
