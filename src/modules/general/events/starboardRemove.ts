import { Event } from "../../../handler";
import { MessageEmbed, MessageReaction, TextBasedChannel, TextChannel, User } from "discord.js";
import prisma from "../../../lib/prisma";
import fetchReaction from "../../../lib/utils";

export default class StarboardRemove extends Event {
  constructor() {
    super('messageReactionRemove', 'starboardRemove');
  }

  async run(client, reaction: MessageReaction, user: User) {
    await fetchReaction(reaction)

    const guildSettings = await prisma.guild.findUnique({
      where: {
        id: reaction.message.guildId
      }
    })
    if (!guildSettings || !guildSettings.starboard_channel) return

    if (reaction.emoji.toString() !== guildSettings.starboard_emoji) return
    if (reaction.message.author.id === user.id) return

    const starboard = <TextBasedChannel>(await reaction.message.guild.channels.fetch(guildSettings.starboard_channel))
    if (!starboard) return

    const messageInDatabase = await prisma.starredMessage.findUnique({
      where: {
        guildId_starredMessageId: {
          guildId: reaction.message.guildId,
          starredMessageId: reaction.message.id
        }
      }
    })
    if (!messageInDatabase) return

    const botMessage = await starboard.messages.fetch(messageInDatabase.botMessageId)
    if (!botMessage) return

    const reactionCount = reaction.count - (reaction.users.cache.has(reaction.message.author.id) ? 1 : 0)

    if (reactionCount >= guildSettings.starboard_count) {
      const embed = new MessageEmbed(botMessage.embeds[0])
      if (reactionCount > 3) embed.setColor("YELLOW")
      if (reactionCount > 5) embed.setColor("ORANGE")
      if (reactionCount > 7) embed.setColor("BLURPLE")
      botMessage.edit({
        content: `${reaction.emoji.toString()} ${reactionCount} <#${reaction.message.channelId}>`,
        embeds: [embed]
      })
    } else {
      await prisma.starredMessage.delete({
        where: {
          guildId_starredMessageId: {
            guildId: reaction.message.guildId,
            starredMessageId: reaction.message.id
          }
        }
      }).catch(e => {})
      await botMessage.delete().catch(e => {})
    }
  }
}