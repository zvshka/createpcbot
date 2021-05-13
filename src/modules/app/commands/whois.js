import {MessageEmbed} from "discord.js";
import Command from "../../../handler/Command";
import User from "../../../schemas/User";

export default class Whois extends Command {
    constructor({commandHandler, fetch}) {
        super('whois', {
            aliases: ['who'],
            info: 'Получить информацию о пользователе из приложения',
            usage: 'whois <nickname>',
            guildOnly: false,
            adminOnly: false
        });
        this.client = commandHandler.client;
        this.fetch = fetch
    }

    async run(message, args) {
        message.delete({timeout: 10000}).catch(_ => {
        })
        if (args.length > 0) {
            const guy = await this.fetch("/getUsers_info.php", {
                name: args.join(" ")
            })
            if (guy.status) {
                const inDatabase = await User.findOne({app: guy.name})
                const embed = new MessageEmbed()
                    .setAuthor(guy.name)
                    .setThumbnail(guy.avatar)
                    .setDescription(`
            **Рейтинг:** ${guy.rating}
            **Дата регистрации:** ${guy.registration}
            **Сборок сейчас опубликовано:** ${guy.configs}
            **Сообщений:** ${guy.messages}
            **Видит рекламу:** ${guy.donater}
            **Штрафов:** ${guy.warns.length > 0 ? guy.warns.reduce((a, b) => a + parseInt(b.points), 0) : 0}
            
            ${inDatabase ? `**Discord:** ${(await message.guild.members.fetch(inDatabase.discord)).displayName} (<@${inDatabase.discord}>)` : ""}`)
                return message.channel.send(embed)
            } else {
                return message.channel.send("Такого человека нет")
            }
        } else {
            const inDatabase = await User.findOne({discord: message.author.id})
            if (inDatabase) {

            } else {

            }
        }
    }
}