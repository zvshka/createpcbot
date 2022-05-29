import {Command} from "../../../handler";
import {Message, MessageEmbed} from "discord.js";
import prisma from "../../../lib/prisma";
import {PrismaClient} from "@prisma/client";

export default class SettingsCommand extends Command {
    constructor() {
        super("settings", {
            adminOnly: true,
            aliases: [],
            guildOnly: true,
            info: "настройки",
            usage: "settings"
        });
    }

    async run(message: Message, args?: string[]) {
        const guildSettings = await prisma.guild.findUnique({
            where: {
                id: message.guildId
            }
        })
        if (args.length === 0) {
            const quotesChannel = await message.guild.channels.fetch(guildSettings.quotes_channel)
            const embed = new MessageEmbed()
                .setTitle("Настройки сервера")
                .addField("Префикс", guildSettings.prefix)
                .addField("кАнал с цитатами", quotesChannel.name || "Не установлен")
                .addField("Префикс цитат", guildSettings.quotes_prefix)

            return message.channel.send({
                embeds: [embed]
            })
        } else {
            const key = args[1]
            if (key in guildSettings) {
                let data;
                if (args[0] === "set") {
                    if (key === "quotes_channel") {
                        if (!message.mentions.channels.first()) return message.channel.send("Ну ты канал то укажи текстовый")
                        data = {
                            quotes_channel: message.mentions.channels.first().id
                        }
                    } else {
                        data = {
                            [key.toLowerCase()]: args.splice(2).join(" ")
                        }
                    }
                    await prisma.guild.update({
                        where: {
                            id: message.guildId
                        },
                        data
                    })
                } else if (args[0] === "remove") {
                    let def
                    switch (key) {
                        case "quotes_prefix":
                            def = "\\"
                            break
                        case "prefix":
                            def = "."
                            break
                        case "quotes_channel":
                            def = null
                            break
                    }
                    await prisma.guild.update({
                        where: {
                            id: message.guildId
                        },
                        data: {
                            [key]: def
                        }
                    })
                }
                return message.channel.send("Ну я типо обновил")
            } else {
                return message.channel.send("Ты можешь написать в качестве ключа только: prefix, quotes_channel, quotes_prefix")
            }
        }
    }
}