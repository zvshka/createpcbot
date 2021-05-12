import Command from "../../../handler/Command";
import Queue from "../../../schemas/Queue";
import User from "../../../schemas/User";
import {MessageEmbed} from "discord.js";

export default class extends Command {
    constructor() {
        super('connect', {
            aliases: ['c'],
            info: 'Присоединить аккаунт приложения',
            usage: 'connect',
            guildOnly: false,
            adminOnly: false
        });
    }


    async run(message) {
        const alreadyIn = await Queue.findOne({discord: message.author.id})
        if (alreadyIn) {
            const embed = new MessageEmbed()
                .setTitle("Ошибка")
                .setColor("RED")
                .setDescription("Вы уже в очереди")
            return message.channel.send(embed)
        }
        const user = await User.findOne({discord: message.author.id})
        if (user) {
            const embed = new MessageEmbed()
                .setTitle("Ошибка")
                .setColor("RED")
                .setDescription("Вы уже в системе")
            return message.channel.send(embed)
        }
        const id = this.makeid(8)
        const embed = new MessageEmbed()
            .setTitle("Успех")
            .setColor("GREEN")
            .setDescription("Ваша задача сделать сборку с описанием, которое будет включать в себя ваш код таким образом: `connect:<code>\nЭта сборка будет удалена в следствии не надобности`")
            .addField("Ваш код", "Выслан вам в ЛС")
        message.author.send(`\`connect:${id}\``).then(() => {
            const nQueue = new Queue({
                discord: message.author.id,
                code: id
            })
            nQueue.save().then(() => message.channel.send(embed))
        })
            .catch(e => {
                if (e) {
                    const embed = new MessageEmbed()
                        .setTitle("Ошибка")
                        .setColor("RED")
                        .setDescription("Нужно чтобы вы открыли личные сообщения")
                    return message.channel.send(embed)
                }
            })
    }

    makeid(length) {
        const result = [];
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < length; i++) {
            result.push(characters.charAt(Math.floor(Math.random() *
                characters.length)));
        }
        return result.join('');
    }
};
