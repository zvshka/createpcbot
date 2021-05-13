import {MessageEmbed} from "discord.js";
import Command from "../../../handler/Command";
import Giveaway from "../../../schemas/Giveaway";
import ms from "ms"

export default class GStart extends Command {
    constructor() {
        super("giveaway_start", {
            aliases: ["gstart"],
            info: "Быстро создать в текущем канале розыгрыш",
            usage: "giveaway_start <time> [winners] [prize]",
            guildOnly: true,
            adminOnly: true
        });
    }
    async run(message, args) {
        if (!args[0] || !ms(args[0]) || ms(args[0]) < 5 * 60 * 1000) {
            const error = new MessageEmbed()
                .setTitle("Ошибка")
                .setDescription("Вы указали время не корректно или оно меньше 5 минут")
            return message.channel.send(error)
        }

        if (args[1] && isNaN(args[1])) {
            const error = new MessageEmbed()
                .setTitle("Ошибка")
                .setDescription("Вы указали не корректное количество победителей")
            return message.channel.send(error)
        }

        const time = ms(args[0])
        const winners = parseInt(args[1]) || 1
        const prize = args.length > 2 ? args.slice(2).join(" ") : "Уточните у админа, проводящего розыгрыш"

        const embed = new MessageEmbed()
            .setTitle("Розыгрыш призов!")
            .setDescription(`${prize}\nПобедителей: ${winners}`)
            .setTimestamp(Date.now() + time)
        const gMessage = await message.channel.send(embed)

        const giveaway = new Giveaway({
            guild: message.guild.id,
            channel: message.channel.id,
            message: gMessage.id,
            winners,
            prize,
            ends: Date.now() + time,
            start: Date.now()
        })
        await giveaway.save().catch(_ => {})
    }
}