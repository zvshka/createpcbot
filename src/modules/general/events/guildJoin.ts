import {Event} from "../../../handler";
import {GuildMember, Message, MessageEmbed} from "discord.js";

import prisma from "../../../lib/prisma";
import axios from "axios";

export default class PingEvent extends Event {
    constructor() {
        super('guildMemberAdd', 'guildMemberAdd');
    }

    async run(client, member: GuildMember) {
        const guildSettings = await prisma.guild.findUnique({
            where: {
                id: member.guild.id
            },
            include: {
                welcomeImages: true,
                welcomeMessages: true
            }
        })
        if (!guildSettings) return
        if (!guildSettings.welcome_channel) return
        const welcomeChannel = await member.guild.channels.fetch(guildSettings.welcome_channel)
        if (!welcomeChannel || welcomeChannel.type !== "GUILD_TEXT") return
        const welcomeEmbed = new MessageEmbed()
            .setTitle(member.guild.name)

        console.log(guildSettings)

        if (guildSettings.welcomeImages.length >= 1) {
            // Тут рандомайз                          Целое          Рандом значение умножаем на кол-во элементов массива
            const {url, isApi, pathToImage} = guildSettings.welcomeImages[Math.floor(Math.random() * guildSettings.welcomeImages.length)]
            if (isApi) {
                const data = await axios.get(url).then(res => res.data)
                const keys = pathToImage.split(".")
                let info = data
                for (let key of keys) {
                    info = info[key]
                }
                welcomeEmbed.setImage(info)
            } else {
                welcomeEmbed.setImage(url)
            }
        }
        if (guildSettings.welcomeMessages.length >= 1) {
            const {text} = guildSettings.welcomeMessages[Math.floor(Math.random() * guildSettings.welcomeMessages.length)]
            welcomeEmbed
                .setDescription(text?.replace("{user}", member.toString()))
        } else {
            welcomeEmbed.setDescription("Добро пожаловать на сервер, " + member.toString())
        }

        return welcomeChannel.send({
            content: member.toString(),
            embeds: [welcomeEmbed]
        })
    }
};
