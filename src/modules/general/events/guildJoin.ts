import {Event} from "../../../handler";
import {GuildMember, Message, MessageEmbed} from "discord.js";

import prisma from "../../../lib/prisma";

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
                welcomeImages: true
            }
        })
        if (!guildSettings) return
        if (!guildSettings.welcome_channel) return
        const welcomeChannel = await member.guild.channels.fetch(guildSettings.welcome_channel)
        if (!welcomeChannel || welcomeChannel.type !== "GUILD_TEXT") return
        if (guildSettings.welcomeImages.length < 1) return
        const {url} = guildSettings.welcomeImages[Math.floor(Math.random() * guildSettings.welcomeImages.length)]
        const welcomeEmbed = new MessageEmbed()
            .setTitle(member.guild.name)
            .setDescription(guildSettings.welcome_message?.replace("{user}", member.toString()) || "Добро пожаловать на сервер, " + member.toString())
            .setImage(url)

        return welcomeChannel.send({
            embeds: [welcomeEmbed]
        })
    }
};
