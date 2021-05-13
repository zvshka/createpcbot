import Command from "../../../handler/Command";
import {MessageEmbed} from "discord.js";
import Giveaway from "../../../schemas/Giveaway";
import rm from "discord.js-reaction-menu"
import Utils from "../../../Utils";
export default class GList extends Command {
    constructor() {
        super("giveaway_list", {
            aliases: ["glist", "giveaways"],
            info: "Посмотреть список розыгрышей на сервере",
            usage: "giveaway_list",
            guildOnly: true,
            adminOnly: true
        });
    }
    async run(message, args) {
        const giveaways = await Giveaway.find({guild: message.guild.id})
        const embed = new MessageEmbed()
            .setTitle("Список розыгрышей на сервере")
        if (giveaways.length < 1) {
            embed.setDescription("Сейчас ничего не проводится")
            return message.channel.send(embed)
        } else if (giveaways.length > 15) {
            const divided = Utils.split(giveaways, 15)
            const pages = divided.map(arr => {
                const e = new MessageEmbed()
                    .setTitle("Список розыгрышей на сервере")
                for (let giveaway of arr) {
                    e.addField(giveaway.prize, `**Начался**: ${giveaway.start}\n**Закончится**: ${giveaway.ends}\n**Победителей**: ${giveaway.winners}\n**Канал**:<#${giveaway.channel}>`)
                }
            })
            return new rm.menu({
                pages
            })
        } else {
            for (let giveaway of giveaways) {
                embed.addField(giveaway.prize, `**Начался**: ${giveaway.start}\n**Закончится**: ${giveaway.ends}\n**Победителей**: ${giveaway.winners}\n**Канал**:<#${giveaway.channel}>`)
            }
            return message.channel.send(embed)
        }
    }
}