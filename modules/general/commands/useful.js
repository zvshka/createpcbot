const {Command} = require('../../../handler');
const Useful = require('../../../schemas/Useful')
const {MessageEmbed} = require("discord.js");
const rm = require('discord.js-reaction-menu')
const Utils = require('../../../Utils')
module.exports = class extends Command {
    constructor() {
        super('useful', {
            aliases: ['полезное'],
            info: 'Полезные ссылки и информация',
            usage: 'useful [add <url> <name>]',
            guildOnly: false,
            adminOnly: false
        });
    }

    async run(message, args) {
        if (args.length < 1) {
            const useful = await Useful.find({}).lean(true)
            if (useful.length < 1) {
                const embed = new MessageEmbed()
                    .setTitle("Ошибка")
                    .setColor("RED")
                    .setDescription("Пока полезной информации никто не добавил")
                return message.channels.send(embed)
            } else {
                const divided = Utils.split(useful, 25)
                if (divided.length < 2) {
                    const embed = new MessageEmbed()
                        .setTitle("Полезные ссылки")
                        .setColor("BLUE")
                    for (let u of useful) {
                        embed.addField(u.description, u.url, true)
                    }
                    return message.channel.send(embed)
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
                    new rm.menu({
                        channel: message.channel,
                        userID: message.author.id,
                        pages: embeds
                    })
                }
            }
        } else if (args[0].toLowerCase() === "add") {
            if (!args[1]) {
                const error = new MessageEmbed()
                    .setTitle("Ошибка")
                    .setColor("RED")
                    .setDescription("Укажите ссылку")
                return message.channel.send(error)
            }
            if (!args[2]) {
                const error = new MessageEmbed()
                    .setTitle("Ошибка")
                    .setColor("RED")
                    .setDescription("Укажите описание")
                return message.channel.send(error)
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
                return message.channel.send(embed)
            })
        }
    }
};
