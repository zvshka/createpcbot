import { Event } from "../../../handler";
import { MessageEmbed, MessageReaction, TextBasedChannel, TextChannel, User } from "discord.js";

import prisma from "../../../lib/prisma";
import fetchReaction from "../../../lib/utils";

export default class StarboardAdd extends Event {
  constructor() {
    super('messageReactionAdd', 'starboardAdd');
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

    const reactionCount = reaction.count - (reaction.users.cache.has(reaction.message.author.id) ? 1 : 0)

    if (reactionCount < guildSettings.starboard_count) return

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
    if (!messageInDatabase) {
      const embed = new MessageEmbed()
        .setAuthor({ name: reaction.message.author.username, iconURL: reaction.message.author.avatarURL() })
        .setDescription(reaction.message.content)
        .addField('Souce:', `[Jump!](${reaction.message.url})`)
        .setTimestamp()

      if (reactionCount > 3) embed.setColor("YELLOW")
      if (reactionCount > 5) embed.setColor("ORANGE")
      if (reactionCount > 7) embed.setColor("BLURPLE")

      const channel = <TextChannel>reaction.message.channel

      if (reaction.message.attachments.size > 0 && !channel.nsfw) {
        embed.setImage(reaction.message.attachments.first().url)
      }

      const newMessage = await starboard.send({
        content: `${reaction.emoji.toString()} ${reactionCount} <#${reaction.message.channelId}>`,
        embeds: [embed]
      }).catch(e => {})

      if (!newMessage) return

      await prisma.starredMessage.create({
        data: {
          guildId: newMessage.guildId,
          starredMessageId: reaction.message.id,
          botMessageId: newMessage.id,
          // stars: reactionCount
        }
      })
    } else {
      const botMessage = await starboard.messages.fetch(messageInDatabase.botMessageId).catch(e => {})
      if (!botMessage) return
      const embed = new MessageEmbed(botMessage.embeds[0])
      if (reactionCount > 3) embed.setColor("YELLOW")
      if (reactionCount > 5) embed.setColor("ORANGE")
      if (reactionCount > 7) embed.setColor("BLURPLE")
      botMessage.edit({
        content: `${reaction.emoji.toString()} ${reactionCount} <#${reaction.message.channelId}>`,
        embeds: [embed]
      }).catch(e => {})
      //
      //   await prisma.starredMessage.update({
      //     where: {
      //       guildId_starredMessageId: {
      //         guildId: reaction.message.guildId,
      //         starredMessageId: reaction.message.id
      //       }
      //     },
      //     data: {
      //       stars: {
      //         increment: 1
      //       }
      //     }
      //   })
      // }
      //
      // await prisma.member.upsert({
      //   where: {
      //     guildId_id: {
      //       guildId: reaction.message.guildId,
      //       id: user.id
      //     }
      //   },
      //   create: {
      //     id: user.id,
      //     guildId: reaction.message.guildId,
      //     stars_given: 1
      //   },
      //   update: {
      //     stars_given: {
      //       increment: 1
      //     }
      //   },
      // }).catch(e => {})
      //
      // await prisma.member.upsert({
      //   where: {
      //     guildId_id: {
      //       guildId: reaction.message.guildId,
      //       id: reaction.message.author.id
      //     }
      //   },
      //   create: {
      //     guildId: reaction.message.guildId,
      //     id: reaction.message.author.id,
      //     stats_received: reactionCount
      //   },
      //   update: {
      //     stats_received: {
      //       increment: 1
      //     }
      //   }
      // }).catch(e => {})
    }
  }
};
