import {Event} from "../../../handler";
import {Message} from "discord.js";

// const answers = [
//     "{user}, слушай, ты чето попутал",
//     "Твоя мать прекрасная женщина",
//     "Может ты себе очко пинганешь, дырявый?",
//     "Нахуй вы гидру кикнули ебланы?",
//     "Мудила, Рукоблуд, ссанина, очко, блядун, вагина Сука, ебланище, влагалище, пердун, дрочила, Пидор, пизда, туз, малафья, Гомик, мудила, пилотка, манда",
//     "Помогите пупержи написать меня на пайтоне, он старается (нет) :spravebidlo:",
// ]

import prisma from "../../../lib/prisma";

export default class PingEvent extends Event {
    constructor() {
        super('messageCreate', 'ping');
    }

    async run(client, message: Message) {
        const guildSettings = await prisma.guild.findUnique({
            where: {
                id: message.guildId
            },
            include: {
                answers: true
            }
        })
        if (!guildSettings) return
        if (guildSettings.answers.length === 0) return
        const {text} = guildSettings.answers[Math.floor(Math.random() * guildSettings.answers.length)]
        if (message.mentions.has(client.user.id)) {
            return message.channel.send(text.replace("{user}", message.author.toString()))
        }
    }
};
