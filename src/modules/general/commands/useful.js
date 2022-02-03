import Command from "../../../handler/Command";
import Useful from "../../../schemas/Useful";
import {MessageEmbed} from "discord.js";
// import rm from "discord.js-reaction-menu"
import Utils from "../../../Utils";

export default class UsefulCommand extends Command {
    constructor() {
        super('useful', {
            aliases: ['полезное'],
            info: 'Полезные ссылки и информация',
            usage: 'useful [add <url> <name>]',
            guildOnly: false,
            adminOnly: false
        });
        this.toggle()
    }

    async run(message, args) {
        if (args.length < 1) {
            const useful = await Useful.find({}).lean(true)
            if (useful.length < 1) {
                const embed = new MessageEmbed()
                    .setTitle("Ошибка")
                    .setColor("RED")
                    .setDescription("Пока полезной информации никто не добавил")
                return message.channel.send({
                    embeds: [embed]
                })
            } else {
                const divided = Utils.split(useful, 25)
                if (divided.length < 2) {
                    const embed = new MessageEmbed()
                        .setTitle("Полезные ссылки")
                        .setColor("BLUE")
                    for (let u of useful) {
                        embed.addField(u.description, u.url, true)
                    }
                    return message.channel.send({
                        embeds: [embed]
                    })
                } else {
                    const embeds = divided.map(arr => {
                        const embed = new MessageEmbed()
                            .setTitle("Полезные ссылки")
                            .setColor("BLUE")
                        for (let u of arr) {
                            embed.addField(u.description, u.url, true)
                        }
                        return embed
                    })
                    return message.channel.send({
                        embeds
                    })
                }
            }
        } else if (args[0].toLowerCase() === "add") {
            if (!args[1]) {
                const error = new MessageEmbed()
                    .setTitle("Ошибка")
                    .setColor("RED")
                    .setDescription("Укажите ссылку")
                return message.channel.send({
                    embeds: [error]
                })
            }
            if (!args[2]) {
                const error = new MessageEmbed()
                    .setTitle("Ошибка")
                    .setColor("RED")
                    .setDescription("Укажите описание")
                return message.channel.send({
                    embeds: [error]
                })
            }
            const nUseful = new Useful({
                url: args[1],
                description: args.slice(2).join(" ")
            })
            await nUseful.save().then(() => {
                const embed = new MessageEmbed()
                    .setTitle("Успешно")
                    .setColor("GREEN")
                    .setDescription("Ссылка успешно сохранена")
                return message.channel.send({
                    embeds: [embed]
                })
            })
        } else if (args[0].toLowerCase() === "remove") {
            if (!args[1]) {
                const error = new MessageEmbed()
                    .setTitle("Ошибка")
                    .setColor("RED")
                    .setDescription("Укажите номер ссылки")
                return message.channel.send({
                    embeds: [error]
                })
            }
            const useful = await Useful.find({}).lean(true)
            const index = parseInt(args[1])
            if (isNaN(args[1])) return message.channel.send("Пошел нахуй, число укажи")
            if (index < 0 || index > useful.length) return message.channel.send(`Ебнутый, укажи от 1 до ${useful.length}`)
            await Useful.deleteOne({
                url: useful[index - 1].url
            }).then(() => message.channel.send("Удалил блять, доволен?"))
        }

    }
};
