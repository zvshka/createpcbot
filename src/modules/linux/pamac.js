import {MessageEmbed} from "discord.js";
import Command from "../../handler/Command";
import axios from "axios";
import {minify} from "terser";
import {importFromString} from "module-from-string";

export default class PamacCommand extends Command {
    constructor({commandHandler}) {
        super('pamac', {
            aliases: [],
            info: 'Pamac',
            usage: 'Pamac install',
            guildOnly: false,
            adminOnly: false
        });
        this.handler = commandHandler
    }

    async run(message, args) {
        if (args[0].toLowerCase() === "install") {
            try {
                const attachment = message.attachments.first()
                if (!attachment) return message.channel.send("Мне что, блять, воздух устанавливать?")
                const res = await axios.get(attachment.url)
                const result = await minify(res.data);
                let cmd = await importFromString(result.code)
                if (!cmd.run) return message.channel.send("Не, ну ты бы хоть шаблон посмотрел")
                await this.handler.db.command.create({
                    data: {
                        code: Buffer.from(result.code),
                        file_name: attachment.name,
                        name: args[1]
                    }
                })
            } catch (e) {
                console.log(e)
            }
        }
    }
};
