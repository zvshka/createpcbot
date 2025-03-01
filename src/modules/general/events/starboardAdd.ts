import { Event } from '../../../handler';
import {
  ChannelType,
  Client,
  Colors,
  EmbedBuilder,
  Events,
  MessageReaction,
  TextBasedChannel,
  TextChannel,
  User
} from 'discord.js';

import prisma from '../../../lib/prisma';
import fetchReaction from '../../../lib/utils';
import { editEmbed } from '../../../lib/starboard';

export default class StarboardAdd extends Event {
  constructor() {
    super(Events.MessageReactionAdd, 'starboardAdd');
  }

  async run(client: Client<boolean>, reaction: MessageReaction, user: User) {
    if (reaction.partial) await fetchReaction(reaction);

    const guildSettings = await prisma.guild.findUnique({
      where: {
        id: reaction.message.guildId
      }
    });
    if (!guildSettings || !guildSettings.starboard_channel) return;

    if (reaction.emoji.toString() !== guildSettings.starboard_emoji) return;
    if (reaction.message.author.id === user.id) return;

    const reactionCount = reaction.count - (reaction.users.cache.has(reaction.message.author.id) ? 1 : 0);

    if (reactionCount < guildSettings.starboard_count) return;

    const starboard = await reaction.message.guild.channels.fetch(guildSettings.starboard_channel) as TextBasedChannel;
    if (!starboard || starboard.type === ChannelType.GroupDM) return;

    const messageInDatabase = await prisma.starredMessage.findUnique({
      where: {
        guildId_starredMessageId: {
          guildId: reaction.message.guildId,
          starredMessageId: reaction.message.id
        }
      }
    });

    if (!messageInDatabase) {
      const embed = new EmbedBuilder()
        .setAuthor({ name: reaction.message.author.username, iconURL: reaction.message.author.avatarURL() })
        .addFields({ name: 'Souce:', value: `[Jump!](${reaction.message.url})` })
        .setTimestamp();

      if (reaction.message.content && reaction.message.content.length > 0) {
        embed.setDescription(reaction.message.content)
      }

      if (reactionCount > 3) embed.setColor(Colors.Yellow);
      if (reactionCount > 5) embed.setColor(Colors.Orange);
      if (reactionCount > 7) embed.setColor(Colors.Blurple);

      const reactionChannel = reaction.message.channel as TextChannel;

      if (!reactionChannel.nsfw) {
        if (reaction.message.attachments.size > 0) {
          embed.setImage(reaction.message.attachments.first().url);
        }
      }

      const starboardMessage = await starboard.send({
        content: `${reaction.emoji.toString()} **${reactionCount}** <#${reaction.message.channelId}>`,
        embeds: [embed]
      }).catch(e => {
        console.log("[ERROR] Произошла ошибка при отправке сообщения в канал!")
        console.log(e);
      });

      if (!starboardMessage) return;

      await prisma.starredMessage.create({
        data: {
          guildId: starboardMessage.guildId,
          starredMessageId: reaction.message.id,
          botMessageId: starboardMessage.id,
        }
      });
    } else {
      const botMessage = await starboard.messages.fetch(messageInDatabase.botMessageId).catch(e => {
      });
      if (botMessage) {
        await editEmbed({ botMessage, reaction, reactionCount });
      }
    }
  }
};
