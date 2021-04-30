const {MessageEmbed} = require("discord.js");
const {Command} = require('../../../handler');
const User = require('../../../schemas/User')

module.exports = class extends Command {
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
        message.delete({timeout: 10000}).catch(e => {
        })
        const guy = await this.fetch("/getUsers_info.php", {
            name: args.join(" ")
        })
        if (guy.status) {
            const inDatabase = await User.findOne({app: guy.name})
            const embed = new MessageEmbed()
                .setAuthor(guy.name)
                .setThumbnail(guy.avatar)
                .setDescription(`
            Рейтинг: ${guy.rating}
            Дата регистрации: ${guy.registration}
            Сборок сейчас опубликовано: ${guy.configs}
            Сообщений: ${guy.messages}
            Видит рекламу: ${guy.donater}
            
            ${inDatabase ? `Discord: ${
                    ((await message.guild.members.fetch(inDatabase.discord)).displayName)
                } (<@${inDatabase.discord}>)` : ""}`)
            return message.channel.send(embed)
        } else {
            return message.channel.send("Такого человека нет")
        }

    }
};