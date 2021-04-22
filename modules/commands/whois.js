const axios = require("axios");
const {MessageEmbed} = require("discord.js");
const {Command} = require('../../handler');

module.exports = class extends Command {
    constructor({commandHandler}) {
        super('whois', {
            aliases: ['who'],
            info: 'Получить информацию о пользователе из приложения',
            usage: 'whois <nickname>',
            guildOnly: false,
            adminOnly: false
        });
        this.client = commandHandler.client;
    }

    async run(message, args) {
        message.delete()
        const guy = await axios.post(process.env.baseURL + "/getUsers_info.php", `name=${args.join(" ")}`)
        const result = guy.data.RESULT === "true"
        if (result) {
            const data = JSON.parse(guy.data.MESSAGE)
            const embed = new MessageEmbed()
                .setAuthor(data.name)
                .setThumbnail(data.avatar)
                .setDescription(`
            Рейтинг: ${data.rating}
            Дата регистрации: ${data.date_registration}
            Сборок сейчас опубликовано: ${data.count_publish_config}
            Сообщений: ${data.count_message}
            Видит рекламу: ${Boolean(data.ShowAds) ? "Да" : "Нет"}`)
            return message.channel.send(embed)
        } else {
            return message.channel.send("Такого человека нет")
        }
    }
};
